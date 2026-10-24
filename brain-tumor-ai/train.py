"""Training script for Brain Tumor Classification models.

Usage:
    python train.py --model hybrid --epochs 25 --batch_size 16 --learning_rate 0.0001
    python train.py --model resnet50 --epochs 20 --batch_size 16
    python train.py --model efficientnet_b0 --epochs 20 --batch_size 16
    python train.py --model convnext_tiny --epochs 20 --batch_size 16
    python train.py --model swin_t --epochs 20 --batch_size 16
"""

import argparse
import datetime
import json
import os
import sys
from pathlib import Path
import torch
from torch.utils.data import DataLoader

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from ml.calibration.temperature_scaling import TemperatureScaler, compute_ece
from ml.datasets.dataset import create_dataloaders
from ml.datasets.sample_generator import build_synthetic_dataset
from ml.models import build_model
from ml.training.trainer import Trainer, set_seed
from ml.utils.visualization import plot_training_history
from evaluate import evaluate_model
from evaluate_external import evaluate_external_test


def parse_args():
    parser = argparse.ArgumentParser(
        description="Attention-Enhanced Hybrid CNN-Transformer Brain Tumor Training"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="hybrid",
        choices=["hybrid", "resnet50", "efficientnet_b0", "convnext_tiny", "swin_t"],
        help="Model architecture to train",
    )
    parser.add_argument("--dataset_dir", type=str, default="brain-tumor-ai/dataset", help="Dataset directory")
    parser.add_argument("--epochs", type=int, default=25, help="Total training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--learning_rate", type=float, default=1e-4, help="Initial learning rate")
    parser.add_argument("--backbone_lr", type=float, default=1e-5, help="Backbone fine-tuning LR (Stage 2)")
    parser.add_argument("--loss", type=str, default="ce", choices=["ce", "focal"], help="Loss criterion")
    parser.add_argument("--focal_gamma", type=float, default=2.0, help="Gamma exponent for Focal Loss")
    parser.add_argument("--weight_decay", type=float, default=1e-2, help="Weight decay for AdamW")
    parser.add_argument("--stage2_epoch", type=int, default=6, help="Epoch to unfreeze backbones for Stage 2")
    parser.add_argument("--early_stopping_patience", type=int, default=10, help="Early stopping patience")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--output_dir", type=str, default=None, help="Custom output directory")
    parser.add_argument("--pretrained", action="store_true", default=False, help="Use ImageNet pretrained weights")
    parser.add_argument("--selection_metric", type=str, default="f1_macro", choices=["f1_macro", "val_loss", "accuracy"])
    return parser.parse_args()


def main():
    args = parse_args()
    set_seed(args.seed)

    # 1. Verify Dataset
    data_path = Path(args.dataset_dir)
    if not (data_path / "train").exists() or not any((data_path / "train").iterdir()):
        print(f"Dataset not found or empty at {data_path}. Generating realistic benchmark CT dataset...")
        build_synthetic_dataset(str(data_path))

    train_ds, val_ds, test_ds, classes = create_dataloaders(
        dataset_dir=str(data_path),
        batch_size=args.batch_size,
    )
    num_classes = len(classes)
    print(f"Loaded dataset with {num_classes} classes: {classes}")
    print(f"Partitions: Train={len(train_ds)}, Val={len(val_ds)}, Test={len(test_ds)}")

    # 2. Experiment Output Directory
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    run_id = f"{args.model}_{timestamp}"
    if args.output_dir:
        exp_dir = Path(args.output_dir)
    else:
        exp_dir = Path("brain-tumor-ai/experiments") / run_id
    exp_dir.mkdir(parents=True, exist_ok=True)

    # Save experiment config
    config = vars(args)
    config["classes"] = classes
    config["run_id"] = run_id
    config["created_at"] = datetime.datetime.now().isoformat()
    with open(exp_dir / "config.json", "w") as f:
        json.dump(config, f, indent=2)

    # 3. Build Model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Building [{args.model}] with {num_classes} classes on device [{device}]...")
    model = build_model(
        model_name=args.model,
        num_classes=num_classes,
        pretrained=args.pretrained,
    )

    param_count = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"Model parameters: {total_params:,} (Trainable: {param_count:,})")

    # 4. Data Loaders
    num_workers = 0 if os.name == "nt" else 2
    train_loader = DataLoader(
        train_ds, batch_size=args.batch_size, shuffle=True, num_workers=num_workers, drop_last=False
    )
    val_loader = DataLoader(
        val_ds, batch_size=args.batch_size, shuffle=False, num_workers=num_workers
    )
    test_loader = DataLoader(
        test_ds, batch_size=args.batch_size, shuffle=False, num_workers=num_workers
    )

    # 5. Trainer
    trainer = Trainer(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        class_names=classes,
        device=device,
        output_dir=str(exp_dir),
        loss_type=args.loss,
        focal_gamma=args.focal_gamma,
        learning_rate=args.learning_rate,
        backbone_lr=args.backbone_lr,
        weight_decay=args.weight_decay,
        stage2_epoch=args.stage2_epoch,
        early_stopping_patience=args.early_stopping_patience,
        selection_metric=args.selection_metric,
    )

    train_results = trainer.train(total_epochs=args.epochs)
    print(f"Training finished. Best score: {train_results['best_score']}")

    # 6. Plot Training Curves
    history_file = exp_dir / "training_history.json"
    if history_file.exists():
        with open(history_file, "r") as f:
            history = json.load(f)
        plot_training_history(history, str(exp_dir / "training_curves.png"))
        print(f"Training curves saved to {exp_dir / 'training_curves.png'}")

    # 7. Post-Hoc Temperature Calibration
    print("\n--- Performing Temperature Calibration on Validation Set ---")
    val_logits = train_results["val_logits"].to(device)
    val_targets = train_results["val_targets"].to(device)

    # ECE before calibration
    raw_probs = torch.softmax(val_logits, dim=1).detach().cpu().numpy()
    ece_before = compute_ece(raw_probs, val_targets.cpu().numpy())

    scaler = TemperatureScaler().to(device)
    optimal_t = scaler.fit(val_logits, val_targets)

    # ECE after calibration
    calibrated_logits = scaler(val_logits)
    calibrated_probs = torch.softmax(calibrated_logits, dim=1).detach().cpu().numpy()
    ece_after = compute_ece(calibrated_probs, val_targets.cpu().numpy())

    scaler.save(str(exp_dir / "temperature.json"), ece_before, ece_after)
    print(f"Optimal Temperature: T={optimal_t:.4f} | ECE: {ece_before:.4f} -> {ece_after:.4f}")

    # 8. Evaluate on Internal Held-Out Test Set
    print("\n--- Evaluating Best Model on Internal Held-Out Test Set ---")
    best_model_file = exp_dir / "best_model.pth"
    if best_model_file.exists():
        evaluate_model(
            checkpoint_path=str(best_model_file),
            dataset_dir=args.dataset_dir,
            batch_size=args.batch_size,
            output_dir=str(exp_dir),
        )

    # 9. Evaluate on External Hospital Benchmark
    ext_dir = Path("External_Test")
    if ext_dir.exists() and best_model_file.exists():
        print("\n--- Evaluating Best Model on External Hospital Test Set ---")
        evaluate_external_test(
            checkpoint_path=str(best_model_file),
            external_dir=str(ext_dir),
            output_dir=str(exp_dir),
        )

    print(f"\nExperiment artifacts successfully recorded at: {exp_dir.resolve()}")


if __name__ == "__main__":
    main()
