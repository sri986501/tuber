"""Evaluation of trained model on the unseen External_Test clinical cohort.

Calculates:
- External Test Binary Stroke Detection Accuracy
- Sensitivity (Stroke Recall)
- Specificity (Normal Recall)
- F1-Score & ROC-AUC on unseen scans
- Per-sample predictions table
"""

import argparse
import json
import os
import sys
from pathlib import Path
import numpy as np
import pandas as pd
from PIL import Image
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
import torch

# Ensure project root is in path
sys.path.insert(0, str(Path(__file__).parent))

from ml.calibration.temperature_scaling import TemperatureScaler
from ml.models import build_model
from ml.utils.preprocessing import MedicalCTTransform


def evaluate_external_test(
    checkpoint_path: str,
    external_dir: str = "External_Test",
    output_dir: str = None,
):
    chk_p = Path(checkpoint_path)
    if chk_p.is_dir():
        exp_dir = chk_p
        model_file = chk_p / "best_model.pth"
    else:
        model_file = chk_p
        exp_dir = chk_p.parent

    out_dir = Path(output_dir) if output_dir else exp_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1. Config
    config_file = exp_dir / "config.json"
    if config_file.exists():
        with open(config_file, "r") as f:
            config = json.load(f)
        model_name = config.get("model", "efficientnet_b0")
        classes = config.get("classes", ["Bleeding", "Ischemia", "Normal"])
    else:
        model_name = "efficientnet_b0"
        classes = ["Bleeding", "Ischemia", "Normal"]

    # 2. Model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = build_model(model_name=model_name, num_classes=len(classes))
    checkpoint_data = torch.load(model_file, map_location=device)
    state_dict = checkpoint_data["model_state_dict"] if "model_state_dict" in checkpoint_data else checkpoint_data
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    # Temperature Scaler if present
    temp_file = exp_dir / "temperature.json"
    scaler = TemperatureScaler.load(str(temp_file)).to(device) if temp_file.exists() else None

    # 3. Read External Test labels
    ext_p = Path(external_dir)
    labels_file = ext_p / "labels.csv"
    if not labels_file.exists():
        raise FileNotFoundError(f"labels.csv not found in {external_dir}")

    df_labels = pd.read_csv(labels_file)
    png_dir = ext_p / "PNG"

    transform = MedicalCTTransform(is_training=False)

    normal_idx = classes.index("Normal") if "Normal" in classes else 2

    y_true_stroke = []
    y_pred_stroke = []
    y_prob_stroke = []
    results = []

    print(f"\n[External_Test] Running evaluation on {len(df_labels)} external clinical scans...")
    with torch.no_grad():
        for _, row in df_labels.iterrows():
            img_id = int(row["image_id"])
            ground_truth_stroke = int(row["Stroke"])

            img_path = png_dir / f"{img_id}.png"
            if not img_path.exists():
                print(f"[Warning] Image not found: {img_path}")
                continue

            pil_img = Image.open(img_path).convert("RGB")
            tensor = transform(pil_img).unsqueeze(0).to(device)

            logits = model(tensor)
            if scaler is not None:
                logits = scaler(logits)

            probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
            pred_class_idx = int(np.argmax(probs))
            pred_class_name = classes[pred_class_idx]

            # Binary stroke probability: 1 - P(Normal)
            prob_stroke = float(1.0 - probs[normal_idx])
            pred_stroke = 1 if prob_stroke >= 0.50 else 0

            y_true_stroke.append(ground_truth_stroke)
            y_pred_stroke.append(pred_stroke)
            y_prob_stroke.append(prob_stroke)

            results.append({
                "image_id": img_id,
                "ground_truth_stroke": ground_truth_stroke,
                "predicted_stroke": pred_stroke,
                "predicted_pathology": pred_class_name,
                "prob_stroke": round(prob_stroke, 4),
                "prob_bleeding": round(float(probs[classes.index("Bleeding")]), 4) if "Bleeding" in classes else 0,
                "prob_ischemia": round(float(probs[classes.index("Ischemia")]), 4) if "Ischemia" in classes else 0,
                "prob_normal": round(float(probs[normal_idx]), 4),
            })

    y_true_np = np.array(y_true_stroke)
    y_pred_np = np.array(y_pred_stroke)
    y_prob_np = np.array(y_prob_stroke)

    acc = accuracy_score(y_true_np, y_pred_np)
    prec = precision_score(y_true_np, y_pred_np, zero_division=0)
    rec = recall_score(y_true_np, y_pred_np, zero_division=0)  # Sensitivity
    f1 = f1_score(y_true_np, y_pred_np, zero_division=0)
    auc = roc_auc_score(y_true_np, y_prob_np) if len(np.unique(y_true_np)) > 1 else 0.0

    cm = confusion_matrix(y_true_np, y_pred_np)
    tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

    metrics = {
        "external_test_samples": len(y_true_np),
        "accuracy": round(float(acc), 4),
        "sensitivity_recall": round(float(rec), 4),
        "specificity": round(float(specificity), 4),
        "precision": round(float(prec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(auc), 4),
        "confusion_matrix": {
            "true_negatives_normal": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives_stroke": int(tp),
        },
    }

    print("\n" + "=" * 55)
    print("=== EXTERNAL TEST GENERALIZATION BENCHMARK RESULTS ===")
    print("=" * 55)
    print(f"Total Scans Evaluated: {len(y_true_np)}")
    print(f"Stroke Detection Accuracy: {acc * 100:.2f}%")
    print(f"Sensitivity (Stroke Recall): {rec * 100:.2f}%")
    print(f"Specificity (Normal Recall): {specificity * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"F1-Score: {f1:.4f}")
    print(f"ROC-AUC: {auc:.4f}")
    print(f"Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    print("=" * 55)

    metrics_file = out_dir / "external_test_metrics.json"
    with open(metrics_file, "w") as f:
        json.dump(metrics, f, indent=2)

    df_out = pd.DataFrame(results)
    df_out.to_csv(out_dir / "external_test_predictions.csv", index=False)
    print(f"Saved external test metrics to: {metrics_file}")
    print(f"Saved external predictions to: {out_dir / 'external_test_predictions.csv'}")

    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", type=str, default="brain-tumor-ai/experiments/hybrid_proposed/best_model.pth")
    parser.add_argument("--external_dir", type=str, default="External_Test")
    parser.add_argument("--output_dir", type=str, default=None)
    args = parser.parse_args()
    evaluate_external_test(args.checkpoint, args.external_dir, args.output_dir)
