"""Comprehensive medical evaluation metrics for brain tumor classification.

Computes:
- Overall Accuracy & Balanced Accuracy
- Macro & Weighted Precision, Recall (Sensitivity), Specificity, F1-Score
- Multi-class One-vs-Rest ROC-AUC
- Per-class diagnostic breakdown (TP, FP, TN, FN, Precision, Recall, Specificity, F1)
- Confusion matrix array
"""

from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)


def compute_multiclass_specificity(cm: np.ndarray) -> np.ndarray:
    """Computes per-class specificity from confusion matrix.

    For class i:
    True Negatives (TN) = Sum of all elements except row i and col i.
    False Positives (FP) = Sum of col i minus element (i, i).
    Specificity = TN / (TN + FP)
    """
    num_classes = cm.shape[0]
    total_samples = np.sum(cm)
    specificities = np.zeros(num_classes, dtype=np.float64)

    for i in range(num_classes):
        tp = cm[i, i]
        fn = np.sum(cm[i, :]) - tp
        fp = np.sum(cm[:, i]) - tp
        tn = total_samples - (tp + fp + fn)
        specificities[i] = tn / (tn + fp) if (tn + fp) > 0 else 0.0

    return specificities


def calculate_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: Optional[np.ndarray] = None,
    class_names: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Computes exhaustive classification metrics for medical decision support."""
    y_true = np.asarray(y_true, dtype=int)
    y_pred = np.asarray(y_pred, dtype=int)

    num_classes = len(np.unique(np.concatenate([y_true, y_pred])))
    if class_names is None:
        class_names = [f"Class_{i}" for i in range(num_classes)]

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(class_names))))
    specificities = compute_multiclass_specificity(cm)

    # Core scores
    acc = float(accuracy_score(y_true, y_pred))
    bal_acc = float(balanced_accuracy_score(y_true, y_pred))

    # Precision
    prec_macro = float(precision_score(y_true, y_pred, average="macro", zero_division=0))
    prec_weighted = float(precision_score(y_true, y_pred, average="weighted", zero_division=0))
    prec_per_class = precision_score(y_true, y_pred, average=None, zero_division=0).tolist()

    # Recall / Sensitivity
    rec_macro = float(recall_score(y_true, y_pred, average="macro", zero_division=0))
    rec_weighted = float(recall_score(y_true, y_pred, average="weighted", zero_division=0))
    rec_per_class = recall_score(y_true, y_pred, average=None, zero_division=0).tolist()

    # F1 Score
    f1_macro = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    f1_weighted = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))
    f1_per_class = f1_score(y_true, y_pred, average=None, zero_division=0).tolist()

    # Specificity
    spec_macro = float(np.mean(specificities))
    spec_per_class = specificities.tolist()

    # ROC-AUC (multi-class OvR)
    roc_auc_macro = None
    roc_auc_weighted = None
    if y_prob is not None:
        try:
            roc_auc_macro = float(roc_auc_score(y_true, y_prob, multi_class="ovr", average="macro"))
            roc_auc_weighted = float(roc_auc_score(y_true, y_prob, multi_class="ovr", average="weighted"))
        except Exception:
            roc_auc_macro = 0.0
            roc_auc_weighted = 0.0

    # Per-class summary dictionary
    per_class_summary = {}
    for i, name in enumerate(class_names):
        per_class_summary[name] = {
            "precision": float(prec_per_class[i]),
            "recall": float(rec_per_class[i]),
            "specificity": float(spec_per_class[i]),
            "f1_score": float(f1_per_class[i]),
            "support": int(np.sum(y_true == i)),
        }

    return {
        "accuracy": acc,
        "balanced_accuracy": bal_acc,
        "precision_macro": prec_macro,
        "precision_weighted": prec_weighted,
        "recall_macro": rec_macro,
        "recall_weighted": rec_weighted,
        "sensitivity": rec_macro,  # synonym for clinical reporting
        "specificity_macro": spec_macro,
        "f1_macro": f1_macro,
        "f1_weighted": f1_weighted,
        "roc_auc_macro": roc_auc_macro,
        "roc_auc_weighted": roc_auc_weighted,
        "confusion_matrix": cm.tolist(),
        "per_class": per_class_summary,
        "class_names": class_names,
    }
