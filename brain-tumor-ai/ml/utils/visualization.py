"""Clinical-grade visualization utilities for brain tumor classification.

Generates:
- Confusion matrix heatmap with counts and percentages
- Multi-class One-vs-Rest ROC curves with AUC scores
- Training and validation loss & accuracy trajectory curves
"""

from pathlib import Path
from typing import Dict, List, Optional
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import auc, roc_curve


# Clinical color palette: Calm Slate, Cyan, Emerald, Rose
CLINICAL_COLORS = ["#0891b2", "#10b981", "#f59e0b", "#ef4444", "#6366f1"]


def plot_confusion_matrix(
    cm: np.ndarray,
    class_names: List[str],
    output_path: str,
    normalize: bool = True,
    title: str = "Confusion Matrix",
):
    """Renders a clinical confusion matrix heatmap using matplotlib."""
    fig, ax = plt.subplots(figsize=(7, 6), dpi=300)

    if normalize:
        cm_display = cm.astype("float") / (cm.sum(axis=1)[:, np.newaxis] + 1e-12)
    else:
        cm_display = cm.astype("float")

    im = ax.imshow(cm_display, interpolation="nearest", cmap="Blues")
    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.ax.tick_params(labelsize=9)

    tick_marks = np.arange(len(class_names))
    ax.set_xticks(tick_marks)
    ax.set_yticks(tick_marks)
    ax.set_xticklabels(class_names, rotation=35, ha="right", fontsize=9, color="#1e293b")
    ax.set_yticklabels(class_names, fontsize=9, color="#1e293b")

    thresh = cm_display.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            val_str = f"{cm[i, j]}\n({cm_display[i, j]*100:.1f}%)" if normalize else f"{cm[i, j]}"
            color = "white" if cm_display[i, j] > thresh else "#0f172a"
            ax.text(j, i, val_str, ha="center", va="center", color=color, fontsize=9, fontweight="medium")

    ax.set_title(title, fontsize=13, fontweight="bold", pad=12, color="#0f172a")
    ax.set_xlabel("Predicted Category", fontsize=11, fontweight="semibold", labelpad=8, color="#334155")
    ax.set_ylabel("Ground Truth Pathology", fontsize=11, fontweight="semibold", labelpad=8, color="#334155")
    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()


def plot_multiclass_roc_curves(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    class_names: List[str],
    output_path: str,
    title: str = "Receiver Operating Characteristic (ROC)",
):
    """Renders multi-class One-vs-Rest ROC curves."""
    plt.figure(figsize=(7, 6), dpi=300)

    num_classes = len(class_names)
    for i in range(num_classes):
        # Binarize for class i
        y_true_binary = (y_true == i).astype(int)
        if len(np.unique(y_true_binary)) > 1:
            fpr, tpr, _ = roc_curve(y_true_binary, y_prob[:, i])
            roc_auc = auc(fpr, tpr)
            color = CLINICAL_COLORS[i % len(CLINICAL_COLORS)]
            plt.plot(fpr, tpr, color=color, lw=2, label=f"{class_names[i]} (AUC = {roc_auc:.3f})")

    plt.plot([0, 1], [0, 1], color="#94a3b8", lw=1.5, linestyle="--", label="Chance (AUC = 0.500)")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate (1 - Specificity)", fontsize=11, fontweight="semibold", color="#334155")
    plt.ylabel("True Positive Rate (Sensitivity)", fontsize=11, fontweight="semibold", color="#334155")
    plt.title(title, fontsize=13, fontweight="bold", pad=12, color="#0f172a")
    plt.legend(loc="lower right", frameon=True, facecolor="#ffffff", edgecolor="#cbd5e1", fontsize=9)
    plt.grid(True, linestyle=":", alpha=0.6, color="#cbd5e1")
    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()


def plot_training_history(history: Dict[str, List[float]], output_path: str):
    """Renders dual-axis loss and accuracy learning trajectories."""
    epochs = history.get("epoch", list(range(1, len(history["train_loss"]) + 1)))

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5), dpi=300)

    # Loss plot
    ax1.plot(epochs, history["train_loss"], label="Training Loss", color="#0284c7", lw=2)
    ax1.plot(epochs, history["val_loss"], label="Validation Loss", color="#e11d48", lw=2, linestyle="--")
    ax1.set_title("Loss Trajectory", fontsize=12, fontweight="bold", color="#0f172a")
    ax1.set_xlabel("Epoch", fontsize=10, color="#334155")
    ax1.set_ylabel("Loss", fontsize=10, color="#334155")
    ax1.legend(frameon=True, facecolor="#ffffff", edgecolor="#e2e8f0")
    ax1.grid(True, linestyle=":", alpha=0.6, color="#cbd5e1")

    # Accuracy / F1 plot
    ax2.plot(epochs, history["train_acc"], label="Train Acc", color="#0284c7", lw=1.5)
    ax2.plot(epochs, history["val_acc"], label="Val Acc", color="#059669", lw=2)
    if "val_f1" in history:
        ax2.plot(epochs, history["val_f1"], label="Val Macro F1", color="#d97706", lw=2, linestyle="--")
    ax2.set_title("Performance Metrics Trajectory", fontsize=12, fontweight="bold", color="#0f172a")
    ax2.set_xlabel("Epoch", fontsize=10, color="#334155")
    ax2.set_ylabel("Metric Score", fontsize=10, color="#334155")
    ax2.legend(frameon=True, facecolor="#ffffff", edgecolor="#e2e8f0")
    ax2.grid(True, linestyle=":", alpha=0.6, color="#cbd5e1")

    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()
