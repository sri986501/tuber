"""Confidence Calibration via Temperature Scaling and ECE calculation.

Post-processing calibration for deep networks (Guo et al., 2017).
Optimizes a single scalar temperature T > 0 on validation set logits using NLL loss.
Prevents overconfident misclassifications common in modern deep neural networks.
"""

import json
from pathlib import Path
from typing import Dict, Optional, Tuple
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim


def compute_ece(probs: np.ndarray, labels: np.ndarray, n_bins: int = 15) -> float:
    """Computes Expected Calibration Error (ECE).

    Args:
        probs: Array of predicted probability distributions [N, num_classes]
        labels: Ground truth labels [N]
        n_bins: Number of confidence bins
    """
    confidences = np.max(probs, axis=1)
    predictions = np.argmax(probs, axis=1)
    accuracies = predictions == labels

    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    total_samples = len(labels)

    for i in range(n_bins):
        bin_lower = bin_boundaries[i]
        bin_upper = bin_boundaries[i + 1]

        in_bin = (confidences > bin_lower) & (confidences <= bin_upper)
        prop_in_bin = np.mean(in_bin)

        if prop_in_bin > 0:
            accuracy_in_bin = np.mean(accuracies[in_bin])
            avg_confidence_in_bin = np.mean(confidences[in_bin])
            ece += np.abs(avg_confidence_in_bin - accuracy_in_bin) * prop_in_bin

    return float(ece)


class TemperatureScaler(nn.Module):
    """Calibrates confidence of a trained model via a learnable scalar temperature parameter."""

    def __init__(self):
        super().__init__()
        self.temperature = nn.Parameter(torch.ones(1) * 1.5)

    def forward(self, logits: torch.Tensor) -> torch.Tensor:
        """Scales logits by 1 / T."""
        return logits / self.temperature

    def fit(self, val_logits: torch.Tensor, val_labels: torch.Tensor, max_iter: int = 50) -> float:
        """Optimizes temperature parameter using L-BFGS to minimize NLL on validation set."""
        self.temperature.data.fill_(1.5)
        nll_criterion = nn.CrossEntropyLoss()

        optimizer = optim.LBFGS([self.temperature], lr=0.01, max_iter=max_iter)

        def eval_loss():
            optimizer.zero_grad()
            loss = nll_criterion(self.forward(val_logits), val_labels)
            loss.backward()
            return loss

        optimizer.step(eval_loss)

        # Enforce positive temperature
        with torch.no_grad():
            if self.temperature.item() <= 0.01:
                self.temperature.data.fill_(0.01)

        return float(self.temperature.item())

    def save(self, output_path: str, ece_before: float, ece_after: float):
        """Saves temperature scaling metadata to disk."""
        data = {
            "temperature": float(self.temperature.item()),
            "ece_before_calibration": float(ece_before),
            "ece_after_calibration": float(ece_after),
            "calibrated": True,
        }
        with open(output_path, "w") as f:
            json.dump(data, f, indent=2)

    @classmethod
    def load(cls, config_path: str) -> "TemperatureScaler":
        """Loads saved temperature from JSON config."""
        scaler = cls()
        path = Path(config_path)
        if path.exists():
            with open(path, "r") as f:
                data = json.load(f)
            t_val = float(data.get("temperature", 1.0))
            scaler.temperature.data.fill_(t_val)
        return scaler
