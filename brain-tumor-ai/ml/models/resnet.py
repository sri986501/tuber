"""ResNet50 Baseline Model for Brain Tumor Detection."""

from typing import Optional
import torch
import torch.nn as nn
import torchvision.models as models


class ResNet50Baseline(nn.Module):
    """ResNet-50 baseline with custom classification head and Grad-CAM support."""

    def __init__(self, num_classes: int = 4, pretrained: bool = False, dropout: float = 0.3):
        super().__init__()
        weights = models.ResNet50_Weights.DEFAULT if pretrained else None
        base_model = models.resnet50(weights=weights)

        self.conv1 = base_model.conv1
        self.bn1 = base_model.bn1
        self.relu = base_model.relu
        self.maxpool = base_model.maxpool

        self.layer1 = base_model.layer1
        self.layer2 = base_model.layer2
        self.layer3 = base_model.layer3
        self.layer4 = base_model.layer4

        self.avgpool = base_model.avgpool
        self.dropout = nn.Dropout(p=dropout)
        self.fc = nn.Linear(base_model.fc.in_features, num_classes)

        self.gradients: Optional[torch.Tensor] = None
        self.activations: Optional[torch.Tensor] = None

    def _save_gradient_hook(self, grad: torch.Tensor):
        self.gradients = grad

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)

        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)

        if x.requires_grad:
            self.activations = x
            if x.requires_grad:
                x.register_hook(self._save_gradient_hook)

        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.dropout(x)
        logits = self.fc(x)
        return logits
