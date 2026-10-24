"""ConvNeXt-Tiny Baseline Model for Brain Tumor Detection."""

from typing import Optional
import torch
import torch.nn as nn
import torchvision.models as models


class ConvNeXtTinyBaseline(nn.Module):
    """ConvNeXt-Tiny baseline model with custom classification head."""

    def __init__(self, num_classes: int = 4, pretrained: bool = False, dropout: float = 0.3):
        super().__init__()
        weights = models.ConvNeXt_Tiny_Weights.DEFAULT if pretrained else None
        base_model = models.convnext_tiny(weights=weights)

        self.features = base_model.features
        self.avgpool = base_model.avgpool

        in_features = base_model.classifier[2].in_features
        self.classifier = nn.Sequential(
            base_model.classifier[0],  # LayerNorm
            base_model.classifier[1],  # Flatten
            nn.Dropout(p=dropout),
            nn.Linear(in_features, num_classes),
        )

        self.gradients: Optional[torch.Tensor] = None
        self.activations: Optional[torch.Tensor] = None

    def _save_gradient_hook(self, grad: torch.Tensor):
        self.gradients = grad

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.features(x)

        if x.requires_grad:
            self.activations = feat
            if feat.requires_grad:
                feat.register_hook(self._save_gradient_hook)

        pooled = self.avgpool(feat)
        logits = self.classifier(pooled)
        return logits
