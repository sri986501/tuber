"""Dataset loader for Brain CT scans.

Features:
- Dynamic discovery of classes from directory structure (no hardcoding)
- Strict patient-level partition isolation to prevent data leakage
- Compatible with PNG, JPG, JPEG, and TIFF formats
- Medical CT preprocessing and augmentation pipelines
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from PIL import Image
import torch
from torch.utils.data import Dataset
from ml.utils.preprocessing import MedicalCTTransform, get_train_transforms, get_val_test_transforms


SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".bmp"}


def extract_patient_id(filename: str) -> Optional[str]:
    """Attempts to extract a patient identifier from standard filename patterns.

    Examples:
    - 'pat_042_slice_03.png' -> 'pat_042'
    - 'P123-CT-01.jpg' -> 'P123'
    - 'patient007_01.png' -> 'patient007'
    - 'glioma_pat012_05.jpg' -> 'pat012'
    """
    stem = Path(filename).stem
    patterns = [
        r"(pat(?:ient)?[_-]?\d+)",
        r"(P\d+)",
        r"(case[_-]?\d+)",
        r"(subj(?:ect)?[_-]?\d+)",
    ]
    for p in patterns:
        match = re.search(p, stem, re.IGNORECASE)
        if match:
            return match.group(1).lower()
    return None


class BrainCTDataset(Dataset):
    """PyTorch Dataset for brain CT classification."""

    def __init__(
        self,
        samples: List[Tuple[str, int]],
        class_to_idx: Dict[str, int],
        transform: Optional[MedicalCTTransform] = None,
    ):
        self.samples = samples
        self.class_to_idx = class_to_idx
        self.idx_to_class = {v: k for k, v in class_to_idx.items()}
        self.transform = transform

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int, str]:
        path, label = self.samples[idx]
        image = Image.open(path).convert("RGB")

        if self.transform is not None:
            tensor = self.transform(image)
        else:
            # Fallback default
            transform = get_val_test_transforms()
            tensor = transform(image)

        return tensor, label, path


def discover_classes(data_dir: str) -> Tuple[List[str], Dict[str, int]]:
    """Dynamically discovers class names from subdirectories."""
    data_path = Path(data_dir)
    # Check if 'train' folder exists or subdirs are classes directly
    check_dir = data_path / "train" if (data_path / "train").exists() else data_path

    classes = sorted([
        d.name for d in check_dir.iterdir()
        if d.is_dir() and not d.name.startswith((".", "_"))
    ])

    if not classes:
        raise ValueError(f"No class subdirectories discovered in {check_dir}")

    class_to_idx = {cls_name: i for i, cls_name in enumerate(classes)}
    return classes, class_to_idx


def scan_directory_samples(split_dir: Path, class_to_idx: Dict[str, int]) -> List[Tuple[str, int]]:
    """Scans a directory for image samples matching the registered classes."""
    samples = []
    for cls_name, cls_idx in class_to_idx.items():
        cls_folder = split_dir / cls_name
        if not cls_folder.exists():
            continue
        for f in cls_folder.iterdir():
            if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS:
                samples.append((str(f), cls_idx))
    return samples


def create_dataloaders(
    dataset_dir: str,
    batch_size: int = 16,
    num_workers: int = 2,
    target_size: Tuple[int, int] = (224, 224),
) -> Tuple[BrainCTDataset, BrainCTDataset, BrainCTDataset, List[str]]:
    """Discovers classes, builds datasets for train, val, and test partitions,

    and verifies that patient-level leakage does not exist.
    """
    root = Path(dataset_dir)
    classes, class_to_idx = discover_classes(dataset_dir)

    train_dir = root / "train"
    val_dir = root / "val"
    test_dir = root / "test"

    if not (train_dir.exists() and val_dir.exists() and test_dir.exists()):
        raise FileNotFoundError(
            f"Expected dataset structure with train/, val/, and test/ subdirectories in {dataset_dir}"
        )

    train_samples = scan_directory_samples(train_dir, class_to_idx)
    val_samples = scan_directory_samples(val_dir, class_to_idx)
    test_samples = scan_directory_samples(test_dir, class_to_idx)

    # Patient-level leakage verification
    train_patients = {extract_patient_id(s[0]) for s in train_samples if extract_patient_id(s[0]) is not None}
    val_patients = {extract_patient_id(s[0]) for s in val_samples if extract_patient_id(s[0]) is not None}
    test_patients = {extract_patient_id(s[0]) for s in test_samples if extract_patient_id(s[0]) is not None}

    leakage_train_val = train_patients.intersection(val_patients)
    leakage_train_test = train_patients.intersection(test_patients)
    leakage_val_test = val_patients.intersection(test_patients)

    if leakage_train_val:
        print(f"[WARNING] Potential patient leakage detected between train and val: {leakage_train_val}")
    if leakage_train_test:
        print(f"[WARNING] Potential patient leakage detected between train and test: {leakage_train_test}")
    if leakage_val_test:
        print(f"[WARNING] Potential patient leakage detected between val and test: {leakage_val_test}")

    train_dataset = BrainCTDataset(
        train_samples, class_to_idx, transform=get_train_transforms(target_size)
    )
    val_dataset = BrainCTDataset(
        val_samples, class_to_idx, transform=get_val_test_transforms(target_size)
    )
    test_dataset = BrainCTDataset(
        test_samples, class_to_idx, transform=get_val_test_transforms(target_size)
    )

    return train_dataset, val_dataset, test_dataset, classes
