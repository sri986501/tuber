"""Experiment management service for scanning, comparing, and switching model runs."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent


class ExperimentService:
    """Discovers experiments from experiments/ directory and prepares comparison tables."""

    def __init__(self, experiments_root: Optional[str] = None):
        self.root = Path(experiments_root) if experiments_root else ROOT_DIR / "experiments"
        self.root.mkdir(parents=True, exist_ok=True)

    def list_experiments(self, active_checkpoint: Optional[str] = None) -> List[Dict[str, Any]]:
        """Scans experiments directory and extracts evaluation summaries."""
        experiments = []

        if not self.root.exists():
            return experiments

        for exp_folder in sorted(self.root.iterdir()):
            if not exp_folder.is_dir():
                continue

            config_path = exp_folder / "config.json"
            metrics_path = exp_folder / "metrics.json"
            best_model_path = exp_folder / "best_model.pth"

            if not (config_path.exists() and best_model_path.exists()):
                continue

            with open(config_path, "r") as f:
                config = json.load(f)

            metrics = {}
            if metrics_path.exists():
                with open(metrics_path, "r") as f:
                    metrics = json.load(f)

            run_id = exp_folder.name
            is_active = False
            if active_checkpoint:
                active_p = Path(active_checkpoint).resolve()
                if exp_folder.resolve() == active_p or best_model_path.resolve() == active_p:
                    is_active = True

            experiments.append({
                "run_id": run_id,
                "model_name": config.get("model", run_id),
                "accuracy": round(metrics.get("accuracy", 0.0) * 100, 2),
                "balanced_accuracy": round(metrics.get("balanced_accuracy", 0.0) * 100, 2),
                "precision_macro": round(metrics.get("precision_macro", 0.0) * 100, 2),
                "recall_macro": round(metrics.get("recall_macro", 0.0) * 100, 2),
                "specificity_macro": round(metrics.get("specificity_macro", 0.0) * 100, 2),
                "f1_macro": round(metrics.get("f1_macro", 0.0) * 100, 2),
                "roc_auc_macro": round(metrics.get("roc_auc_macro", 0.0), 4) if metrics.get("roc_auc_macro") is not None else 0.0,
                "total_parameters": metrics.get("total_parameters", 0),
                "mean_inference_time_ms": metrics.get("mean_inference_time_ms", 0.0),
                "ece_calibrated": metrics.get("ece_calibrated", 0.0),
                "created_at": config.get("created_at"),
                "is_active": is_active,
                "checkpoint_path": str(best_model_path),
                "has_metrics": metrics_path.exists(),
                "confusion_matrix_url": f"/static/experiments/{run_id}/confusion_matrix.png" if (exp_folder / "confusion_matrix.png").exists() else None,
                "roc_curve_url": f"/static/experiments/{run_id}/roc_curve.png" if (exp_folder / "roc_curve.png").exists() else None,
                "training_curves_url": f"/static/experiments/{run_id}/training_curves.png" if (exp_folder / "training_curves.png").exists() else None,
            })

        return experiments

    def get_experiment_detail(self, run_id: str) -> Optional[Dict[str, Any]]:
        """Returns exhaustive details of a single experiment run."""
        exp_folder = self.root / run_id
        if not exp_folder.exists() or not exp_folder.is_dir():
            return None

        metrics_file = exp_folder / "metrics.json"
        config_file = exp_folder / "config.json"
        history_file = exp_folder / "training_history.json"
        temp_file = exp_folder / "temperature.json"

        data: Dict[str, Any] = {"run_id": run_id}
        if config_file.exists():
            with open(config_file, "r") as f:
                data["config"] = json.load(f)
        if metrics_file.exists():
            with open(metrics_file, "r") as f:
                data["metrics"] = json.load(f)
        if history_file.exists():
            with open(history_file, "r") as f:
                data["history"] = json.load(f)
        if temp_file.exists():
            with open(temp_file, "r") as f:
                data["temperature"] = json.load(f)

        data["confusion_matrix_url"] = f"/static/experiments/{run_id}/confusion_matrix.png" if (exp_folder / "confusion_matrix.png").exists() else None
        data["roc_curve_url"] = f"/static/experiments/{run_id}/roc_curve.png" if (exp_folder / "roc_curve.png").exists() else None
        data["training_curves_url"] = f"/static/experiments/{run_id}/training_curves.png" if (exp_folder / "training_curves.png").exists() else None

        return data
