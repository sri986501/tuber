"""Unit tests for Temperature Scaling calibration and ECE calculation."""

import sys
from pathlib import Path
import numpy as np
import pytest
import torch

sys.path.insert(0, str(Path(__file__).parent.parent))

from ml.calibration.temperature_scaling import TemperatureScaler, compute_ece


def test_compute_ece():
    # Perfect calibration synthetic test
    probs = np.array([
        [0.9, 0.1],
        [0.8, 0.2],
        [0.7, 0.3],
        [0.6, 0.4]
    ])
    labels = np.array([0, 0, 0, 0])
    ece = compute_ece(probs, labels, n_bins=5)
    assert 0.0 <= ece <= 1.0


def test_temperature_scaler_fit():
    scaler = TemperatureScaler()
    logits = torch.randn(50, 4) * 5.0  # Overconfident logits
    labels = torch.randint(0, 4, (50,))

    opt_t = scaler.fit(logits, labels, max_iter=20)
    assert opt_t > 0.0
    calibrated = scaler(logits)
    assert calibrated.shape == logits.shape
