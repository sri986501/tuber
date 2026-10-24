"""Swin Transformer-Tiny Baseline Model for Brain Tumor Detection."""

from typing import Optional
import torch
import torch.nn as nn
import torchvision.models as models


class SwinTinyBaseline(nn.Module):
    """Swin Transformer-Tiny baseline model with custom classification head."""

    def __init__(self, num_classes: int = 4, pretrained: bool = False, dropout: float = 0.3):
        super().__init__()
        weights = models.Swin_T_Weights.DEFAULT if pretrained else None
        base_model = models.swin_t(weights=weights)

        self.features = base_model.features
        self.norm = base_model.norm
        self.permute = base_model.permute
        self.avgpool = base_model.avgpool
        self.flatten = base_model.flatten

        in_features = base_model.head.in_features
        self.dropout = nn.Dropout(p=dropout)
        self.head = nn.Linear(in_features, num_classes)

        self.gradients: Optional[torch.Tensor] = None
        self.activations: Optional[torch.Tensor] = None

    def _save_gradient_hook(self, grad: torch.Tensor):
        self.gradients = grad

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.features(x)
        feat = self.norm(feat)

        if x.requires_grad:
            # Swin features are [B, H, W, C]; permute to [B, C, H, W] for activation map
            perm_feat = feat.permute(0, 3, 1, 2)
            self.activations = perm_feat
            if perm_feat.requires_grad:
                perm_feat.register_hook(self._save_gradient_hook)

        p = self.permute(feat)
        pooled = self.avgpool(p)
        flat = self.flatten(pooled)
        flat = self.dropout(flat)
        logits = self.head(flat)
        return logits
