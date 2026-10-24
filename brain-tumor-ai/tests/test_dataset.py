"""Unit tests for dataset loading, class discovery, and patient isolation."""

import os
import sys
from pathlib import Path
import pytest
import torch

sys.path.insert(0, str(Path(__file__).parent.parent))

from ml.datasets.dataset import (
    create_dataloaders,
    discover_classes,
    extract_patient_id,
)
from ml.datasets.sample_generator import generate_brain_ct_slice


def test_extract_patient_id():
    assert extract_patient_id("pat_042_slice_03.png") == "pat_042"
    assert extract_patient_id("P123-CT-01.jpg") == "p123"
    assert extract_patient_id("patient007_01.png") == "patient007"
    assert extract_patient_id("random_file.png") is None


def test_generate_brain_ct_slice():
    slice_img = generate_brain_ct_slice("glioma", size=(128, 128))
    assert slice_img.shape == (128, 128)
    assert slice_img.dtype.name == "uint8"
    assert slice_img.max() > 0


def test_dataset_discovery_and_partitions():
    dataset_dir = "brain-tumor-ai/dataset"
    if not Path(dataset_dir).exists():
        pytest.skip("Dataset directory not found")

    classes, class_to_idx = discover_classes(dataset_dir)
    assert len(classes) >= 2
    assert "glioma" in classes

    train_ds, val_ds, test_ds, cls_names = create_dataloaders(
        dataset_dir, batch_size=8, target_size=(224, 224)
    )
    assert len(train_ds) > 0
    assert len(val_ds) > 0
    assert len(test_ds) > 0

    tensor, label, path = train_ds[0]
    assert tensor.shape == (3, 224, 224)
    assert isinstance(label, int)
