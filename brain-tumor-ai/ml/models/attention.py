"""Attention modules for Brain CT Tumor Detection.

Implements:
1. CBAM (Convolutional Block Attention Module): Channel + Spatial Attention
2. CrossAttentionFusion: Learnable feature fusion for CNN and Transformer tokens
3. AttentionPooling: Learnable spatial attention pooling over fused token representations
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F


class ChannelAttention(nn.Module):
    """Channel Attention Module for CBAM."""

    def __init__(self, in_channels: int, reduction_ratio: int = 16):
        super().__init__()
        reduced_channels = max(1, in_channels // reduction_ratio)
        self.avg_pool = nn.AdaptiveAvgPool2d(1)
        self.max_pool = nn.AdaptiveMaxPool2d(1)

        # Shared MLP implemented with 1x1 convolutions for 2D inputs
        self.mlp = nn.Sequential(
            nn.Conv2d(in_channels, reduced_channels, kernel_size=1, bias=False),
            nn.ReLU(inplace=True),
            nn.Conv2d(reduced_channels, in_channels, kernel_size=1, bias=False),
        )
        self.sigmoid = nn.Sigmoid()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        avg_out = self.mlp(self.avg_pool(x))
        max_out = self.mlp(self.max_pool(x))
        channel_weights = self.sigmoid(avg_out + max_out)
        return x * channel_weights


class SpatialAttention(nn.Module):
    """Spatial Attention Module for CBAM."""

    def __init__(self, kernel_size: int = 7):
        super().__init__()
        assert kernel_size in (3, 7), "Kernel size must be 3 or 7"
        padding = 3 if kernel_size == 7 else 1
        self.conv = nn.Conv2d(2, 1, kernel_size=kernel_size, padding=padding, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        concat = torch.cat([avg_out, max_out], dim=1)
        spatial_weights = self.sigmoid(self.conv(concat))
        return x * spatial_weights


class CBAM(nn.Module):
    """Convolutional Block Attention Module (CBAM).

    Applies sequential channel and spatial attention to emphasize informative
    lesion textures, edges, and morphological abnormalities.
    """

    def __init__(self, in_channels: int, reduction_ratio: int = 16, kernel_size: int = 7):
        super().__init__()
        self.channel_att = ChannelAttention(in_channels, reduction_ratio=reduction_ratio)
        self.spatial_att = SpatialAttention(kernel_size=kernel_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.channel_att(x)
        x = self.spatial_att(x)
        return x


class AttentionFusion(nn.Module):
    """Learnable Attention Fusion between CNN and Transformer representations.

    Transforms both feature maps into projected embedding spaces with LayerNorm,
    computes bidirectional cross-attention, and fuses representations with a
    learnable gating mechanism.
    """

    def __init__(self, cnn_dim: int = 768, transformer_dim: int = 768, embed_dim: int = 512, num_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        self.embed_dim = embed_dim

        # Projections & LayerNorm as required by architecture specification
        self.cnn_proj = nn.Linear(cnn_dim, embed_dim)
        self.cnn_norm = nn.LayerNorm(embed_dim)

        self.trans_proj = nn.Linear(transformer_dim, embed_dim)
        self.trans_norm = nn.LayerNorm(embed_dim)

        # Cross attention: CNN queries global Transformer context
        self.cross_cnn_trans = nn.MultiheadAttention(
            embed_dim=embed_dim,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True,
        )

        # Cross attention: Transformer queries local CNN features
        self.cross_trans_cnn = nn.MultiheadAttention(
            embed_dim=embed_dim,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True,
        )

        # Learnable gating network to blend local and global representations
        self.gate_mlp = nn.Sequential(
            nn.Linear(embed_dim * 2, embed_dim),
            nn.ReLU(inplace=True),
            nn.Linear(embed_dim, embed_dim),
            nn.Sigmoid(),
        )

        self.post_norm = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, cnn_tokens: torch.Tensor, trans_tokens: torch.Tensor) -> torch.Tensor:
        """Args:

        cnn_tokens: [B, N, cnn_dim]
        trans_tokens: [B, N, transformer_dim]

        Returns:
            fused_tokens: [B, N, embed_dim]
        """
        # 1. Projections and LayerNorm
        c_proj = self.cnn_norm(self.cnn_proj(cnn_tokens))
        t_proj = self.trans_norm(self.trans_proj(trans_tokens))

        # 2. Cross-Attention
        # Query: CNN, Key/Val: Transformer -> local features enriched by global context
        c_enriched, _ = self.cross_cnn_trans(query=c_proj, key=t_proj, value=t_proj)
        c_out = c_proj + self.dropout(c_enriched)

        # Query: Transformer, Key/Val: CNN -> global features enriched by local textures
        t_enriched, _ = self.cross_trans_cnn(query=t_proj, key=c_proj, value=c_proj)
        t_out = t_proj + self.dropout(t_enriched)

        # 3. Learnable Gated Fusion
        concat = torch.cat([c_out, t_out], dim=-1)
        gate = self.gate_mlp(concat)
        fused = gate * c_out + (1.0 - gate) * t_out

        return self.post_norm(fused)


class AttentionPooling(nn.Module):
    """Learnable Attention Pooling.

    Computes spatial attention weights across feature tokens to aggregate
    salient lesion regions into a global summary representation.
    """

    def __init__(self, embed_dim: int, hidden_dim: int = 128):
        super().__init__()
        self.attn_net = nn.Sequential(
            nn.Linear(embed_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, 1),
        )

    def forward(self, tokens: torch.Tensor) -> torch.Tensor:
        """Args:

        tokens: [B, N, embed_dim]

        Returns:
            pooled: [B, embed_dim]
        """
        weights = self.attn_net(tokens)  # [B, N, 1]
        attn_scores = F.softmax(weights, dim=1)  # [B, N, 1]
        pooled = torch.sum(tokens * attn_scores, dim=1)  # [B, embed_dim]
        return pooled
