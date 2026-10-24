"""Attention-Enhanced Hybrid CNN-Transformer Network for Brain Tumor Detection.

Architecture Pipeline:
Input Brain CT Image (B, 3, 224, 224)
    ↓
ConvNeXt-Tiny Feature Encoder (Local features, edges, textures, lesion morphology)
    ↓
CBAM Attention (Channel + Spatial Attention)
    ↓
Swin Transformer-Tiny Encoder (Global structural relationships, contextual dependencies)
    ↓
CNN-Transformer Feature Fusion (Projections + LayerNorm + Cross-Attention + Gated Fusion)
    ↓
Attention Pooling (Learnable spatial token weighting)
    ↓
Dense Classification Head (LayerNorm + Dropout + FC)
    ↓
Softmax Probabilities
"""

from typing import Optional, Tuple
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models

from ml.models.attention import CBAM, AttentionFusion, AttentionPooling


class AttentionEnhancedHybridModel(nn.Module):
    """Attention-Enhanced Hybrid ConvNeXt-Tiny + Swin-Transformer-Tiny.

    Combines high-resolution inductive biases from ConvNeXt with global
    contextual modeling from Swin-Transformer through CBAM and learnable cross-attention.
    """

    def __init__(
        self,
        num_classes: int = 4,
        embed_dim: int = 512,
        num_heads: int = 8,
        dropout: float = 0.3,
        pretrained: bool = False,
    ):
        super().__init__()
        self.num_classes = num_classes
        self.embed_dim = embed_dim

        # 1. ConvNeXt-Tiny CNN Feature Encoder
        # Output feature shape for 224x224 input: [B, 768, 7, 7]
        weights_convnext = models.ConvNeXt_Tiny_Weights.DEFAULT if pretrained else None
        base_convnext = models.convnext_tiny(weights=weights_convnext)
        self.cnn_encoder = base_convnext.features

        # 2. CBAM Module applied directly to CNN features
        self.cbam = CBAM(in_channels=768, reduction_ratio=16, kernel_size=7)

        # 3. Swin Transformer-Tiny Encoder
        # Swin features output shape: [B, 7, 7, 768]
        weights_swin = models.Swin_T_Weights.DEFAULT if pretrained else None
        base_swin = models.swin_t(weights=weights_swin)
        self.swin_encoder = base_swin.features
        self.swin_norm = base_swin.norm

        # 4. Attention-Based Feature Fusion
        self.fusion = AttentionFusion(
            cnn_dim=768,
            transformer_dim=768,
            embed_dim=embed_dim,
            num_heads=num_heads,
            dropout=dropout,
        )

        # 5. Attention Pooling
        self.attn_pool = AttentionPooling(embed_dim=embed_dim, hidden_dim=128)

        # 6. Classification Head
        self.head_norm = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(p=dropout)
        self.classifier = nn.Linear(embed_dim, num_classes)

        # Gradients hook storage for Grad-CAM
        self.gradients: Optional[torch.Tensor] = None
        self.activations: Optional[torch.Tensor] = None

    def _save_gradient_hook(self, grad: torch.Tensor):
        self.gradients = grad

    def forward_features(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """Extracts CNN, Transformer, and Fused feature representations.

        Args:
            x: Input CT images of shape [B, 3, 224, 224]

        Returns:
            cnn_cbam: [B, 768, 7, 7] (used for Grad-CAM visualization)
            trans_tokens: [B, 49, 768]
            fused_tokens: [B, 49, embed_dim]
        """
        # CNN local feature extraction + CBAM
        cnn_raw = self.cnn_encoder(x)  # [B, 768, 7, 7]
        cnn_cbam = self.cbam(cnn_raw)  # [B, 768, 7, 7]

        # Enable activation recording for Grad-CAM
        if x.requires_grad:
            self.activations = cnn_cbam
            if cnn_cbam.requires_grad:
                cnn_cbam.register_hook(self._save_gradient_hook)

        # Flatten CNN spatial tokens: [B, 768, 7, 7] -> [B, 49, 768]
        B, C, H, W = cnn_cbam.shape
        cnn_tokens = cnn_cbam.flatten(2).transpose(1, 2)  # [B, 49, 768]

        # Swin Transformer global feature extraction
        trans_raw = self.swin_encoder(x)  # [B, 7, 7, 768]
        trans_normed = self.swin_norm(trans_raw)  # [B, 7, 7, 768]
        trans_tokens = trans_normed.view(B, H * W, -1)  # [B, 49, 768]

        # Cross-Attention learnable fusion
        fused_tokens = self.fusion(cnn_tokens, trans_tokens)  # [B, 49, embed_dim]

        return cnn_cbam, trans_tokens, fused_tokens

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass.

        Args:
            x: Input CT images [B, 3, 224, 224]

        Returns:
            logits: Unnormalized class scores [B, num_classes]
        """
        cnn_cbam, _, fused_tokens = self.forward_features(x)

        # Attention pooling across spatial tokens
        pooled = self.attn_pool(fused_tokens)  # [B, embed_dim]

        # Classification Head
        out = self.head_norm(pooled)
        out = self.dropout(out)
        logits = self.classifier(out)

        return logits

    def freeze_backbones(self):
        """Stage 1: Freeze pretrained backbone layers, training only fusion & heads."""
        for param in self.cnn_encoder.parameters():
            param.requires_grad = False
        for param in self.swin_encoder.parameters():
            param.requires_grad = False
        for param in self.swin_norm.parameters():
            param.requires_grad = False

    def unfreeze_upper_layers(self):
        """Stage 2: Unfreeze upper layers of CNN and Transformer for fine-tuning."""
        # Unfreeze ConvNeXt upper stages (stages 6 and 7)
        for i in range(6, len(self.cnn_encoder)):
            for param in self.cnn_encoder[i].parameters():
                param.requires_grad = True

        # Unfreeze Swin upper stage (layer 7)
        for param in self.swin_encoder[-1].parameters():
            param.requires_grad = True
        for param in self.swin_norm.parameters():
            param.requires_grad = True
