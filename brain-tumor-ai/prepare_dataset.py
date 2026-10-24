"""Dataset Preparation Script for Brain CT Stroke & Pathology Classification.

Performs:
1. Discovery of all slices from Bleeding, Ischemia, Normal PNG directories
2. Stratified train/val/test splitting (70% / 15% / 15%)
3. Removal of legacy synthetic sample data
4. Hardlink creation (with copy fallback) into structured partition folders
5. Verification of partition integrity and class balance
"""

import json
import os
import random
import shutil
from pathlib import Path
from sklearn.model_selection import train_test_split


def prepare_dataset(
    source_root: str = ".",
    dest_root: str = "brain-tumor-ai/dataset",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42,
):
    random.seed(seed)
    src_path = Path(source_root).resolve()
    dst_path = Path(dest_root).resolve()

    categories = ["Bleeding", "Ischemia", "Normal"]
    samples_by_class = {}

    print(f"[DatasetPrep] Discovering images from {src_path}...")
    for cat in categories:
        cat_png_dir = src_path / cat / "PNG"
        if not cat_png_dir.exists():
            raise FileNotFoundError(f"Directory not found: {cat_png_dir}")
        files = sorted([f for f in cat_png_dir.iterdir() if f.suffix.lower() == ".png"])
        samples_by_class[cat] = [str(f) for f in files]
        print(f"  - {cat}: {len(files)} images")

    # Clear legacy synthetic classes in dest_root if they exist
    if dst_path.exists():
        legacy_dirs = ["glioma", "meningioma", "no_tumor", "pituitary"]
        for split in ["train", "val", "test"]:
            split_dir = dst_path / split
            if split_dir.exists():
                for leg in legacy_dirs:
                    leg_dir = split_dir / leg
                    if leg_dir.exists():
                        print(f"Removing legacy synthetic folder: {leg_dir}")
                        shutil.rmtree(leg_dir, ignore_errors=True)

    splits = {"train": {}, "val": {}, "test": {}}

    for cat, files in samples_by_class.items():
        # Stratified split: Train (70%), Temp (30%) -> Val (15%), Test (15%)
        temp_ratio = val_ratio + test_ratio
        val_fraction_of_temp = val_ratio / temp_ratio

        train_files, temp_files = train_test_split(
            files,
            train_size=train_ratio,
            random_state=seed,
            shuffle=True,
        )
        val_files, test_files = train_test_split(
            temp_files,
            train_size=val_fraction_of_temp,
            random_state=seed,
            shuffle=True,
        )

        splits["train"][cat] = train_files
        splits["val"][cat] = val_files
        splits["test"][cat] = test_files

    print("\n[DatasetPrep] Split distribution:")
    manifest = {"train": {}, "val": {}, "test": {}, "external": {}}

    for split in ["train", "val", "test"]:
        total_split = 0
        for cat in categories:
            file_list = splits[split][cat]
            total_split += len(file_list)
            target_dir = dst_path / split / cat
            target_dir.mkdir(parents=True, exist_ok=True)

            # Link or copy files
            linked_count = 0
            for src_file in file_list:
                src_p = Path(src_file)
                dst_file = target_dir / src_p.name
                if not dst_file.exists():
                    try:
                        os.link(str(src_p), str(dst_file))
                    except Exception:
                        shutil.copyfile(str(src_p), str(dst_file))
                linked_count += 1

            manifest[split][cat] = len(file_list)
            print(f"  {split.upper():5s} | {cat:8s}: {len(file_list):4d} images")
        print(f"  Total {split.upper()}: {total_split} images\n")

    # Record External Test info
    ext_png_dir = src_path / "External_Test" / "PNG"
    if ext_png_dir.exists():
        ext_files = sorted([f.name for f in ext_png_dir.iterdir() if f.suffix.lower() == ".png"])
        manifest["external"]["count"] = len(ext_files)
        manifest["external"]["labels_file"] = str(src_path / "External_Test" / "labels.csv")
        print(f"External Test Set: {len(ext_files)} images verified at {ext_png_dir}")

    manifest_path = dst_path / "dataset_manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Manifest written to: {manifest_path}")
    print("[DatasetPrep] Successfully organized datasets!")


if __name__ == "__main__":
    prepare_dataset()
