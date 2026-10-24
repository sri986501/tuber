"""Inference service singleton managing cached deep learning models and Grad-CAM generation."""

import io
import json
import os
import sys
import uuid
from pathlib import Path
from typing import Any, Dict, Optional
from PIL import Image
import numpy as np

# Ensure brain-tumor-ai is in python path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from predict import BrainCTPredictor


class InferenceService:
    """Singleton service maintaining the in-memory PyTorch model and calibration state."""

    _instance: Optional["InferenceService"] = None

    def __init__(self, default_checkpoint: Optional[str] = None):
        self.predictor: Optional[BrainCTPredictor] = None
        self.checkpoint_path: Optional[str] = None
        self.output_dir = ROOT_DIR / "backend" / "static" / "outputs"
        self.output_dir.mkdir(parents=True, exist_ok=True)

        if default_checkpoint and Path(default_checkpoint).exists():
            self.load_model(default_checkpoint)

    @classmethod
    def get_instance(cls, default_checkpoint: Optional[str] = None) -> "InferenceService":
        if cls._instance is None:
            cls._instance = cls(default_checkpoint=default_checkpoint)
        return cls._instance

    def load_model(self, checkpoint_path: str):
        """Loads and caches the model once in memory."""
        chk_p = Path(checkpoint_path)
        if not chk_p.exists():
            raise FileNotFoundError(f"Checkpoint not found at: {checkpoint_path}")

        print(f"[InferenceService] Loading model from checkpoint: {chk_p.resolve()}")
        self.predictor = BrainCTPredictor(checkpoint_path=str(chk_p))
        self.checkpoint_path = str(chk_p)
        print(f"[InferenceService] Active model: {self.predictor.model_name}")

    def predict_image(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Runs the complete calibrated prediction and Grad-CAM generation pipeline."""
        if self.predictor is None:
            raise RuntimeError("No model checkpoint is loaded in InferenceService.")

        # Read image with PIL
        try:
            pil_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Invalid image format: {e}")

        # Unique prefix for output Grad-CAM files
        unique_id = uuid.uuid4().hex[:10]
        prefix = f"{unique_id}_{Path(filename).stem}"

        raw_result = self.predictor.predict(
            image_input=pil_img,
            output_dir=str(self.output_dir),
            prefix=prefix,
        )

        # Convert local file paths into web URLs
        orig_file = Path(raw_result["original_path"]).name if raw_result.get("original_path") else None
        heat_file = Path(raw_result["heatmap_path"]).name if raw_result.get("heatmap_path") else None
        over_file = Path(raw_result["overlay_path"]).name if raw_result.get("overlay_path") else None

        raw_result["original_url"] = f"/static/outputs/{orig_file}" if orig_file else None
        raw_result["heatmap_url"] = f"/static/outputs/{heat_file}" if heat_file else None
        raw_result["overlay_url"] = f"/static/outputs/{over_file}" if over_file else None

        return raw_result

    def get_model_info(self) -> Dict[str, Any]:
        """Returns metadata about the active model."""
        if self.predictor is None:
            return {
                "model_name": "None",
                "num_classes": 0,
                "classes": [],
                "total_parameters": 0,
                "device": "cpu",
                "temperature": 1.0,
                "checkpoint_path": "",
                "is_calibrated": False,
            }

        total_params = sum(p.numel() for p in self.predictor.model.parameters())
        return {
            "model_name": self.predictor.model_name,
            "num_classes": len(self.predictor.class_names),
            "classes": self.predictor.class_names,
            "total_parameters": total_params,
            "device": str(self.predictor.device),
            "temperature": round(self.predictor.temperature_val, 4),
            "checkpoint_path": self.checkpoint_path or "",
            "is_calibrated": self.predictor.scaler is not None,
        }

    def get_active_metrics(self) -> Dict[str, Any]:
        """Returns metrics.json of the currently loaded experiment if available."""
        if not self.checkpoint_path:
            return {}
        p = Path(self.checkpoint_path)
        exp_dir = p if p.is_dir() else p.parent
        metrics_file = exp_dir / "metrics.json"
        if metrics_file.exists():
            with open(metrics_file, "r") as f:
                return json.load(f)
        return {}
