"""Unit tests for medical CT preprocessing and augmentation."""

import sys
from pathlib import Path
import numpy as np
import pytest
from PIL import Image
import torch

sys.path.insert(0, str(Path(__file__).parent.parent))

from ml.utils.preprocessing import (
    apply_clahe,
    apply_noise_suppression,
    ct_intensity_normalize,
    get_train_transforms,
    get_val_test_transforms,
    preprocess_image_for_inference,
)


def test_ct_intensity_normalize():
    arr = np.array([[10, 50], [100, 200]], dtype=np.uint8)
    norm = ct_intensity_normalize(arr)
    assert norm.shape == arr.shape
    assert norm.min() == 0
    assert norm.max() == 255


def test_apply_clahe():
    arr = np.full((64, 64), 128, dtype=np.uint8)
    enhanced = apply_clahe(arr)
    assert enhanced.shape == (64, 64)


def test_apply_noise_suppression():
    arr = np.random.randint(0, 255, (64, 64), dtype=np.uint8)
    denoised = apply_noise_suppression(arr)
    assert denoised.shape == (64, 64)


def test_transforms_pipeline():
    pil_img = Image.fromarray(np.random.randint(0, 255, (256, 256, 3), dtype=np.uint8))
    train_tf = get_train_transforms(target_size=(224, 224))
    val_tf = get_val_test_transforms(target_size=(224, 224))

    tensor_train = train_tf(pil_img)
    tensor_val = val_tf(pil_img)

    assert tensor_train.shape == (3, 224, 224)
    assert tensor_val.shape == (3, 224, 224)


def test_preprocess_for_inference():
    raw_arr = np.random.randint(0, 255, (200, 200, 3), dtype=np.uint8)
    tensor, orig, prep = preprocess_image_for_inference(raw_arr, target_size=(224, 224))

    assert tensor.shape == (1, 3, 224, 224)
    assert orig.shape == (200, 200, 3)
    assert prep.shape == (224, 224, 3)
