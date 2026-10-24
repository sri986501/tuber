"""Evaluation script for trained Brain Tumor Classification models on held-out test data.

Calculates:
- Overall & Balanced Accuracy
- Macro & Weighted Precision, Recall (Sensitivity), Specificity, F1
- Multi-class ROC-AUC
- Parameter Count
- Average Inference Latency (ms per sample)
- Confusion Matrix & ROC visualizations
- Calibrated test evaluation
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
import numpy as np
import torch
from torch.utils.data import DataLoader

sys.path.insert(0, str(Path(__file__).parent))

from ml.calibration.temperature_scaling import TemperatureScaler, compute_ece
from ml.datasets.dataset import create_dataloaders
from ml.models import build_model
from ml.training.metrics import calculate_metrics
from ml.utils.visualization import plot_confusion_matrix, plot_multiclass_roc_curves


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate Brain Tumor Classification Model")
    parser.add_argument("--checkpoint", type=str, required=True, help="Path to best_model.pth or checkpoint directory")
    parser.add_argument("--dataset_dir", type=str, default="brain-tumor-ai/dataset", help="Dataset directory")
    parser.add_argument("--batch_size", type=int, default=16, help="Evaluation batch size")
    parser.add_argument("--output_dir", type=str, default=None, help="Directory to save evaluation artifacts")
    return parser.parse_args()


def evaluate_model(checkpoint_path: str, dataset_dir: str, batch_size: int = 16, output_dir: str = None):
    chk_p = Path(checkpoint_path)
    if chk_p.is_dir():
        exp_dir = chk_p
        model_file = chk_p / "best_model.pth"
    else:
        model_file = chk_p
        exp_dir = chk_p.parent

    if output_dir:
        eval_out_dir = Path(output_dir)
    else:
        eval_out_dir = exp_dir
    eval_out_dir.mkdir(parents=True, exist_ok=True)

    # 1. Load config
    config_file = exp_dir / "config.json"
    if config_file.exists():
        with open(config_file, "r") as f:
            config = json.load(f)
        model_name = config.get("model", "hybrid")
    else:
        model_name = "hybrid"

    # 2. Data Loaders
    _, _, test_ds, classes = create_dataloaders(dataset_dir=dataset_dir, batch_size=batch_size)
    num_classes = len(classes)
    num_workers = 0 if os.name == "nt" else 2
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    # 3. Model instantiation
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = build_model(model_name=model_name, num_classes=num_classes)

    print(f"Loading checkpoint weights from: {model_file}")
    checkpoint_data = torch.load(model_file, map_location=device)
    state_dict = checkpoint_data["model_state_dict"] if "model_state_dict" in checkpoint_data else checkpoint_data
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    # Total parameters
    total_params = sum(p.numel() for p in model.parameters())

    # 4. Temperature Scaler
    temp_file = exp_dir / "temperature.json"
    scaler = TemperatureScaler.load(str(temp_file)).to(device) if temp_file.exists() else None

    # 5. Inference loop on held-out test partition
    all_logits = []
    all_targets = []
    inference_times = []

    with torch.no_grad():
        for images, targets, _ in test_loader:
            images = images.to(device)

            # Measure inference latency per batch
            start_t = time.perf_counter()
            logits = model(images)
            end_t = time.perf_counter()

            batch_latency_ms = (end_t - start_t) * 1000.0 / images.size(0)
            inference_times.append(batch_latency_ms)

            all_logits.append(logits.cpu())
            all_targets.append(targets.cpu())

    cat_logits = torch.cat(all_logits, dim=0)
    cat_targets = torch.cat(all_targets, dim=0).numpy()
    mean_latency = float(np.mean(inference_times))

    # Raw metrics
    raw_probs = torch.softmax(cat_logits, dim=1).numpy()
    raw_preds = np.argmax(raw_probs, axis=1)
    ece_raw = compute_ece(raw_probs, cat_targets)

    # Calibrated metrics
    if scaler is not None:
        with torch.no_grad():
            calib_logits = scaler(cat_logits.to(device)).cpu()
            calib_probs = torch.softmax(calib_logits, dim=1).detach().numpy()
            calib_preds = np.argmax(calib_probs, axis=1)
            ece_calib = compute_ece(calib_probs, cat_targets)
    else:
        calib_probs = raw_probs
        calib_preds = raw_preds
        ece_calib = ece_raw

    # Exhaustive evaluation metrics
    metrics = calculate_metrics(cat_targets, calib_preds, y_prob=calib_probs, class_names=classes)
    metrics["model_name"] = model_name
    metrics["total_parameters"] = total_params
    metrics["mean_inference_time_ms"] = round(mean_latency, 2)
    metrics["ece_raw"] = round(float(ece_raw), 4)
    metrics["ece_calibrated"] = round(float(ece_calib), 4)
    metrics["test_samples_count"] = len(cat_targets)

    # 6. Save metrics.json
    metrics_path = eval_out_dir / "metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved to {metrics_path}")

    # 7. Generate Visualizations
    cm = np.array(metrics["confusion_matrix"])
    cm_path = eval_out_dir / "confusion_matrix.png"
    plot_confusion_matrix(cm, class_names=classes, output_path=str(cm_path), title=f"Confusion Matrix ({model_name})")
    print(f"Confusion matrix saved to {cm_path}")

    roc_path = eval_out_dir / "roc_curve.png"
    plot_multiclass_roc_curves(cat_targets, calib_probs, class_names=classes, output_path=str(roc_path), title=f"ROC Curves ({model_name})")
    print(f"ROC curve saved to {roc_path}")

    # Display concise summary
    print("\n================ EVALUATION SUMMARY ================")
    print(f"Model: {model_name}")
    print(f"Accuracy:           {metrics['accuracy'] * 100:.2f}%")
    print(f"Balanced Accuracy:  {metrics['balanced_accuracy'] * 100:.2f}%")
    print(f"Macro F1 Score:     {metrics['f1_macro'] * 100:.2f}%")
    print(f"Macro Precision:    {metrics['precision_macro'] * 100:.2f}%")
    print(f"Macro Recall/Sens:  {metrics['recall_macro'] * 100:.2f}%")
    print(f"Macro Specificity:  {metrics['specificity_macro'] * 100:.2f}%")
    print(f"Multi-class ROC-AUC:{metrics['roc_auc_macro']:.4f}")
    print(f"Expected Calib Err: {metrics['ece_calibrated']:.4f}")
    print(f"Inference Latency:  {metrics['mean_inference_time_ms']} ms/sample")
    print(f"Parameter Count:    {total_params:,}")
    print("===================================================\n")

    return metrics


if __name__ == "__main__":
    args = parse_args()
    evaluate_model(
        checkpoint_path=args.checkpoint,
        dataset_dir=args.dataset_dir,
        batch_size=args.batch_size,
        output_dir=args.output_dir,
    )
