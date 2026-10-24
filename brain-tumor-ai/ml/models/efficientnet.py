"""EfficientNet-B0 Baseline Model for Brain Tumor Detection."""

from typing import Optional
import torch
import torch.nn as nn
import torchvision.models as models


class EfficientNetB0Baseline(nn.Module):
    """EfficientNet-B0 baseline with custom classification head and Grad-CAM support."""

    def __init__(self, num_classes: int = 4, pretrained: bool = False, dropout: float = 0.3):
        super().__init__()
        weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
        base_model = models.efficientnet_b0(weights=weights)

        self.features = base_model.features
        self.avgpool = base_model.avgpool

        in_features = base_model.classifier[1].in_features
        self.classifier = nn.Sequential(
            nn.Dropout(p=dropout, inplace=True),
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
        flattened = torch.flatten(pooled, 1)
        logits = self.classifier(flattened)
        return logits

    def freeze_backbones(self):
        for param in self.features.parameters():
            param.requires_grad = False

    def unfreeze_upper_layers(self):
        for param in self.features.parameters():
            param.requires_grad = True
