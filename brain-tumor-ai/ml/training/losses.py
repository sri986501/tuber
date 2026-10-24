"""Loss functions for Brain CT Tumor Detection.

Includes:
- Standard CrossEntropyLoss
- Class-Balanced / Weighted CrossEntropy
- Multi-class Focal Loss (handling class imbalance & hard negative boundary examples)
"""

from typing import Optional, Union
import torch
import torch.nn as nn
import torch.nn.functional as F


class FocalLoss(nn.Module):
    """Multi-class Focal Loss.

    FL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)
    Dampens easy, well-classified background/normal examples while focusing
    gradient updates on subtle infiltrative lesion boundaries.
    """

    def __init__(
        self,
        gamma: float = 2.0,
        weight: Optional[torch.Tensor] = None,
        reduction: str = "mean",
    ):
        super().__init__()
        self.gamma = gamma
        self.weight = weight
        self.reduction = reduction

    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """Args:

        inputs: [B, C] unnormalized logits
        targets: [B] class labels
        """
        ce_loss = F.cross_entropy(inputs, targets, weight=self.weight, reduction="none")
        pt = torch.exp(-ce_loss)  # probability of true class
        focal_loss = ((1.0 - pt) ** self.gamma) * ce_loss

        if self.reduction == "mean":
            return focal_loss.mean()
        elif self.reduction == "sum":
            return focal_loss.sum()
        return focal_loss


def build_loss(
    loss_type: str = "ce",
    class_weights: Optional[torch.Tensor] = None,
    focal_gamma: float = 2.0,
    label_smoothing: float = 0.05,
) -> nn.Module:
    """Builds loss function based on configuration."""
    loss_type = loss_type.lower()
    if loss_type in ("ce", "weighted_ce"):
        return nn.CrossEntropyLoss(weight=class_weights, label_smoothing=label_smoothing)
    elif loss_type == "focal":
        return FocalLoss(gamma=focal_gamma, weight=class_weights)
    else:
        raise ValueError(f"Unknown loss type: {loss_type}")
