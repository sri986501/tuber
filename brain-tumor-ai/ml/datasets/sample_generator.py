"""High-Fidelity Brain CT Image Generator for Research and Educational Validation.

Generates anatomically plausible brain CT axial slices simulating:
- Skull calvarium (cortical bone, diploic space, inner table)
- Brain parenchyma (cerebral hemispheres, sulci, gray-white matter gradient)
- Ventricular system (lateral ventricles, third ventricle, CSF hypodensity)
- Pathologies:
  * Glioma: Intra-axial infiltrating heterogeneous mass with finger-like vasogenic edema & mass effect
  * Meningioma: Extra-axial well-demarcated dural-based hyperdense lesion with broad base
  * Pituitary Adenoma: Central skull-base / sellar-suprasellar well-defined lesion
  * No Tumor: Normal symmetric cranial anatomy
- Strict patient-level partition isolation across train, val, and test splits.
"""

import os
from pathlib import Path
from typing import Dict, Optional, Tuple
import cv2
import numpy as np


def generate_brain_ct_slice(
    tumor_type: str,
    size: Tuple[int, int] = (256, 256),
    noise_level: float = 2.0,
    seed: int = 42,
) -> np.ndarray:
    """Generates an anatomically plausible synthetic axial brain CT scan."""
    rng = np.random.default_rng(seed)
    h, w = size
    cx, cy = w // 2, h // 2

    # Canvas initialized to dark background (air: -1000 HU, pixel ~0)
    canvas = np.zeros((h, w), dtype=np.float32)

    # 1. Scalp & Subcutaneous soft tissue (thin outer rim)
    scalp_rx, scalp_ry = int(w * 0.44), int(h * 0.46)
    cv2.ellipse(canvas, (cx, cy), (scalp_rx, scalp_ry), 0, 0, 360, 50.0, -1)

    # 2. Cranial Skull Bone (Cortical bone: +1000 HU, diploe: ~+500 HU)
    # Outer table
    skull_rx, skull_ry = int(w * 0.42), int(h * 0.44)
    cv2.ellipse(canvas, (cx, cy), (skull_rx, skull_ry), 0, 0, 360, 245.0, -1)

    # Cancellous diploic space (middle of skull bone)
    cv2.ellipse(canvas, (cx, cy), (skull_rx - 3, skull_ry - 3), 0, 0, 360, 210.0, -1)

    # Inner table
    cv2.ellipse(canvas, (cx, cy), (skull_rx - 6, skull_ry - 6), 0, 0, 360, 240.0, -1)

    # 3. Brain Parenchyma (Cerebral hemispheres, ~35-40 HU -> pixel ~95-105)
    brain_rx, brain_ry = int(w * 0.38), int(h * 0.40)
    parenchyma_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.ellipse(parenchyma_mask, (cx, cy), (brain_rx, brain_ry), 0, 0, 360, 255, -1)

    # White matter core and cortical gray matter
    canvas[parenchyma_mask > 0] = 100.0  # white matter base

    # Cerebral cortex outer strip (slightly more dense, ~42 HU -> pixel ~110)
    cortex_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.ellipse(cortex_mask, (cx, cy), (brain_rx, brain_ry), 0, 0, 360, 255, -1)
    cv2.ellipse(cortex_mask, (cx, cy), (brain_rx - 4, brain_ry - 4), 0, 0, 360, 0, -1)
    canvas[cortex_mask > 0] = 112.0

    # Longitudinal interhemispheric fissure (falx cerebri)
    cv2.line(canvas, (cx, cy - brain_ry + 4), (cx, cy + brain_ry - 4), 70.0, 1)

    # 4. Ventricular System (Hypodense CSF, ~0-5 HU -> pixel ~25)
    # Frontal and occipital horns of lateral ventricles
    ventricle_mask = np.zeros((h, w), dtype=np.uint8)
    # Left lateral ventricle
    pts_left = np.array([
        [cx - 8, cy - 25],
        [cx - 20, cy - 5],
        [cx - 15, cy + 12],
        [cx - 22, cy + 28],
        [cx - 8, cy + 22],
        [cx - 6, cy - 5]
    ], np.int32)
    cv2.fillPoly(ventricle_mask, [pts_left], 255)

    # Right lateral ventricle
    pts_right = np.array([
        [cx + 8, cy - 25],
        [cx + 20, cy - 5],
        [cx + 15, cy + 12],
        [cx + 22, cy + 28],
        [cx + 8, cy + 22],
        [cx + 6, cy - 5]
    ], np.int32)
    cv2.fillPoly(ventricle_mask, [pts_right], 255)

    # Third ventricle (midline slit)
    cv2.line(ventricle_mask, (cx, cy - 4), (cx, cy + 14), 255, 2)

    # Apply ventricular CSF
    canvas[ventricle_mask > 0] = 25.0

    # 5. Cortical sulci / Sylvian fissures
    for _ in range(8):
        side = rng.choice([-1, 1])
        sx = cx + side * int(rng.uniform(brain_rx * 0.4, brain_rx * 0.85))
        sy = cy + int(rng.uniform(-brain_ry * 0.6, brain_ry * 0.6))
        cv2.ellipse(canvas, (sx, sy), (int(rng.uniform(8, 16)), int(rng.uniform(2, 4))),
                    int(rng.uniform(0, 180)), 0, 360, 45.0, -1)

    # 6. Pathology Insertion
    tumor_type = tumor_type.lower()
    if tumor_type == "glioma":
        # Intra-axial infiltrating mass with necrotic center and vasogenic edema
        side = rng.choice([-1, 1])
        tx = cx + side * int(rng.uniform(25, 45))
        ty = cy + int(rng.uniform(-35, 25))
        t_radius = int(rng.uniform(16, 26))

        # Vasogenic edema (hypodense finger-like digitations, ~65-75 pixel)
        edema_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.circle(edema_mask, (tx, ty), int(t_radius * 1.6), 255, -1)
        for _ in range(5):
            ex = tx + int(rng.uniform(-t_radius * 1.4, t_radius * 1.4))
            ey = ty + int(rng.uniform(-t_radius * 1.4, t_radius * 1.4))
            cv2.circle(edema_mask, (ex, ey), int(rng.uniform(8, 14)), 255, -1)

        # Smooth edema
        edema_mask = cv2.GaussianBlur(edema_mask, (15, 15), 0)
        edema_region = (edema_mask > 50) & (parenchyma_mask > 0) & (ventricle_mask == 0)
        canvas[edema_region] = canvas[edema_region] * 0.70 + 68.0 * 0.30

        # Glioma hyperdense viable rim + heterogeneous solid components
        glioma_solid = np.zeros((h, w), dtype=np.uint8)
        cv2.circle(glioma_solid, (tx, ty), t_radius, 255, -1)
        # Irregular perimeter
        for _ in range(6):
            ix = tx + int(rng.uniform(-t_radius * 0.6, t_radius * 0.6))
            iy = ty + int(rng.uniform(-t_radius * 0.6, t_radius * 0.6))
            cv2.circle(glioma_solid, (ix, iy), int(rng.uniform(6, 12)), 255, -1)
        canvas[glioma_solid > 0] = float(rng.uniform(145.0, 175.0))

        # Central necrotic core (hypodense, ~40-60)
        core_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.circle(core_mask, (tx, ty), max(3, int(t_radius * 0.45)), 255, -1)
        canvas[core_mask > 0] = float(rng.uniform(45.0, 65.0))

    elif tumor_type == "meningioma":
        # Extra-axial, sharply circumscribed, hyperdense, dural-based mass
        # Place near the cranial periphery or falx
        angle_rad = rng.uniform(0.2, 2.9) if rng.random() > 0.5 else rng.uniform(3.4, 6.0)
        dist = brain_rx * rng.uniform(0.72, 0.88)
        tx = int(cx + dist * np.cos(angle_rad))
        ty = int(cy + dist * np.sin(angle_rad))
        m_rx = int(rng.uniform(12, 18))
        m_ry = int(rng.uniform(10, 16))

        # Thin rim of CSF cleft / mild edema
        rim_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.ellipse(rim_mask, (tx, ty), (m_rx + 4, m_ry + 4), 0, 0, 360, 255, -1)
        rim_region = (rim_mask > 0) & (parenchyma_mask > 0)
        canvas[rim_region] = canvas[rim_region] * 0.75 + 65.0 * 0.25

        # Well-demarcated hyperdense meningioma lesion (165-195 HU eq)
        m_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.ellipse(m_mask, (tx, ty), (m_rx, m_ry), int(np.degrees(angle_rad)), 0, 360, 255, -1)
        canvas[m_mask > 0] = float(rng.uniform(170.0, 200.0))

        # Punctate calcification foci common in meningioma
        if rng.random() > 0.4:
            for _ in range(int(rng.uniform(2, 6))):
                cx_calc = tx + int(rng.uniform(-m_rx * 0.5, m_rx * 0.5))
                cy_calc = ty + int(rng.uniform(-m_ry * 0.5, m_ry * 0.5))
                canvas[cy_calc : cy_calc + 2, cx_calc : cx_calc + 2] = 235.0

    elif tumor_type == "pituitary":
        # Central skull base / sellar-suprasellar hyperdense/isodense adenoma
        tx = cx + int(rng.uniform(-3, 3))
        ty = cy - 2 + int(rng.uniform(-4, 6))
        p_rx = int(rng.uniform(10, 15))
        p_ry = int(rng.uniform(9, 13))

        pit_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.ellipse(pit_mask, (tx, ty), (p_rx, p_ry), 0, 0, 360, 255, -1)
        canvas[pit_mask > 0] = float(rng.uniform(155.0, 185.0))

    elif tumor_type == "no_tumor":
        # Strictly normal anatomy - bilateral symmetry intact
        pass

    # 7. Add realistic CT Gaussian quantum noise & mild blur
    noise = rng.normal(0, noise_level, canvas.shape).astype(np.float32)
    # Clip only inside head
    head_mask = canvas > 5.0
    canvas[head_mask] += noise[head_mask]

    # Mild smoothing to mimic CT reconstruction point-spread function
    canvas = cv2.GaussianBlur(canvas, (3, 3), 0.5)

    # Clip to [0, 255]
    final_img = np.clip(canvas, 0, 255).astype(np.uint8)
    return final_img


def build_synthetic_dataset(
    output_root: str,
    samples_per_class: Dict[str, Tuple[int, int, int]] = None,
    image_size: Tuple[int, int] = (256, 256),
):
    """Constructs a full partitioned CT dataset with patient isolation.

    Default splits per class:
    - Train: 60 images (15 patients, 4 slices each)
    - Val: 16 images (4 patients, 4 slices each)
    - Test: 20 images (5 patients, 4 slices each)
    """
    if samples_per_class is None:
        samples_per_class = {
            "glioma": (60, 16, 20),
            "meningioma": (60, 16, 20),
            "pituitary": (60, 16, 20),
            "no_tumor": (60, 16, 20),
        }

    root = Path(output_root)
    patient_counter = 1

    for split_idx, split_name in enumerate(["train", "val", "test"]):
        for cls_name, counts in samples_per_class.items():
            num_samples = counts[split_idx]
            cls_dir = root / split_name / cls_name
            cls_dir.mkdir(parents=True, exist_ok=True)

            # Determine number of patients for this partition
            slices_per_patient = 4
            num_patients = max(1, num_samples // slices_per_patient)

            for p_idx in range(num_patients):
                pat_id = f"pat_{patient_counter:03d}"
                patient_counter += 1
                for s_idx in range(slices_per_patient):
                    seed = hash(f"{pat_id}_{s_idx}_{cls_name}_{split_name}") % (2**31 - 1)
                    img = generate_brain_ct_slice(
                        tumor_type=cls_name,
                        size=image_size,
                        noise_level=1.8,
                        seed=seed,
                    )
                    filename = f"{pat_id}_slice_{s_idx+1:02d}.png"
                    cv2.imwrite(str(cls_dir / filename), img)

    print(f"Dataset generated at: {root.resolve()} with complete patient-level isolation.")


if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else "brain-tumor-ai/dataset"
    build_synthetic_dataset(target)
