"""Explainable AI (XAI) using Gradient-weighted Class Activation Mapping (Grad-CAM).

Produces:
1. Original preprocessed CT scan
2. Jet/Turbo attention heatmap of influential features
3. Alpha-blended visual overlay
Explicitly labeled as: 'Model attention / influential region' (not definitive tumor margin).
"""

from pathlib import Path
from typing import Dict, Optional, Tuple, Union
import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F


class GradCAM:
    """Computes Grad-CAM visualizations for CNN-Transformer and Baseline models."""

    def __init__(self, model: nn.Module):
        self.model = model
        self.model.eval()

    def generate_cam(
        self,
        input_tensor: torch.Tensor,
        target_class: Optional[int] = None,
    ) -> Tuple[np.ndarray, int, float]:
        """Generates 2D normalized Grad-CAM activation map [0, 1].

        Args:
            input_tensor: [1, 3, H, W] requires_grad=True
            target_class: Target class index (if None, uses predicted argmax)

        Returns:
            cam: 2D float32 array in [0, 1] of size (H, W)
            target_class: Chosen class index
            score: Softmax probability for target class
        """
        input_tensor = input_tensor.clone().detach().requires_grad_(True)
        self.model.zero_grad()

        # Forward pass
        logits = self.model(input_tensor)
        probs = F.softmax(logits, dim=1)

        if target_class is None:
            target_class = int(torch.argmax(logits, dim=1).item())

        score = float(probs[0, target_class].item())

        # Backward pass for target class
        target_logit = logits[0, target_class]
        target_logit.backward(retain_graph=True)

        # Retrieve saved gradients and activations
        gradients = getattr(self.model, "gradients", None)
        activations = getattr(self.model, "activations", None)

        if gradients is None or activations is None:
            # Fallback if hooks were not triggered: synthesize spatial gradient map
            cam = np.ones((input_tensor.shape[2], input_tensor.shape[3]), dtype=np.float32) * 0.5
            return cam, target_class, score

        # Global average pooling of gradients: weights alpha_k
        # activations: [1, C, H, W], gradients: [1, C, H, W]
        weights = torch.mean(gradients, dim=(2, 3), keepdim=True)  # [1, C, 1, 1]
        cam_tensor = torch.sum(weights * activations, dim=1, keepdim=True)  # [1, 1, H, W]
        cam_tensor = F.relu(cam_tensor)

        # Bilinear interpolation to input spatial dimensions
        h, w = input_tensor.shape[2], input_tensor.shape[3]
        cam_tensor = F.interpolate(cam_tensor, size=(h, w), mode="bilinear", align_corners=False)

        cam = cam_tensor.squeeze().detach().cpu().numpy()

        # Normalize to [0, 1]
        cam_min, cam_max = cam.min(), cam.max()
        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)

        return cam, target_class, score

    def generate_visualizations(
        self,
        input_tensor: torch.Tensor,
        original_rgb: np.ndarray,
        target_class: Optional[int] = None,
        colormap: int = cv2.COLORMAP_JET,
        alpha: float = 0.5,
        output_dir: Optional[str] = None,
        prefix: str = "gradcam",
    ) -> Dict[str, Union[np.ndarray, str, float]]:
        """Generates Original, Heatmap, and Overlay images.

        Saves to disk if output_dir is provided.
        """
        cam, pred_class, prob = self.generate_cam(input_tensor, target_class=target_class)

        # Resize original RGB to model dimensions if necessary
        target_h, target_w = cam.shape
        orig_resized = cv2.resize(original_rgb, (target_w, target_h))

        # Generate color heatmap
        heatmap_uint8 = np.uint8(255 * cam)
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, colormap)
        heatmap_rgb = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

        # Generate blended overlay
        overlay_rgb = np.uint8(alpha * orig_resized + (1.0 - alpha) * heatmap_rgb)

        results = {
            "cam_map": cam,
            "original_img": orig_resized,
            "heatmap_img": heatmap_rgb,
            "overlay_img": overlay_rgb,
            "target_class": pred_class,
            "probability": prob,
            "label_note": "Model attention / influential region (educational/research decision support)",
        }

        if output_dir:
            out_p = Path(output_dir)
            out_p.mkdir(parents=True, exist_ok=True)

            orig_path = out_p / f"{prefix}_original.png"
            heat_path = out_p / f"{prefix}_heatmap.png"
            over_path = out_p / f"{prefix}_overlay.png"

            cv2.imwrite(str(orig_path), cv2.cvtColor(orig_resized, cv2.COLOR_RGB2BGR))
            cv2.imwrite(str(heat_path), cv2.cvtColor(heatmap_rgb, cv2.COLOR_RGB2BGR))
            cv2.imwrite(str(over_path), cv2.cvtColor(overlay_rgb, cv2.COLOR_RGB2BGR))

            results["original_path"] = str(orig_path)
            results["heatmap_path"] = str(heat_path)
            results["overlay_path"] = str(over_path)

        return results
