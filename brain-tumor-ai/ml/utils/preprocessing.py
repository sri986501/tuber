"""Medical Brain CT Preprocessing and Augmentation Pipeline.

Adheres strictly to medical imaging principles:
- Hounsfield/intensity windowing and normalization
- CLAHE (Contrast-Limited Adaptive Histogram Equalization) for soft-tissue/edema delineation
- Edge-preserving noise suppression (bilateral filter)
- Anatomically plausible augmentations (minor rotation, subtle contrast/brightness, minor scale)
"""

from typing import Tuple, Union
import cv2
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as T
import torchvision.transforms.functional as TF


# Standard ImageNet mean and std used for transfer learning feature normalization
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def apply_noise_suppression(img_np: np.ndarray) -> np.ndarray:
    """Edge-preserving bilateral filter to suppress CT quantum noise

    without blurring tumor or ventricular boundaries.
    """
    if len(img_np.shape) == 2:
        return cv2.bilateralFilter(img_np, d=5, sigmaColor=35, sigmaSpace=35)
    elif len(img_np.shape) == 3:
        # Process in LAB color space if multi-channel to preserve luminance
        lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
        lab[:, :, 0] = cv2.bilateralFilter(lab[:, :, 0], d=5, sigmaColor=35, sigmaSpace=35)
        return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    return img_np


def apply_clahe(img_np: np.ndarray, clip_limit: float = 2.0, tile_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
    """Applies Contrast Limited Adaptive Histogram Equalization (CLAHE)

    to accentuate gray-white matter differentiation and mass margins.
    """
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_size)
    if len(img_np.shape) == 2:
        return clahe.apply(img_np)
    elif len(img_np.shape) == 3:
        lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
        lab[:, :, 0] = clahe.apply(lab[:, :, 0])
        return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    return img_np


def ct_intensity_normalize(img_np: np.ndarray) -> np.ndarray:
    """Normalizes intensity range to standard 8-bit [0, 255] window."""
    img_float = img_np.astype(np.float32)
    min_val, max_val = img_float.min(), img_float.max()
    if max_val > min_val:
        normalized = (img_float - min_val) / (max_val - min_val) * 255.0
    else:
        normalized = img_float
    return np.clip(normalized, 0, 255).astype(np.uint8)


class MedicalCTTransform:
    """Custom PyTorch transform implementing medical CT preprocessing."""

    def __init__(self, target_size: Tuple[int, int] = (224, 224), is_training: bool = False):
        self.target_size = target_size
        self.is_training = is_training

    def __call__(self, img: Image.Image) -> torch.Tensor:
        # Pre-downscale for high performance on CPU if large image
        if img.size[0] > 256 or img.size[1] > 256:
            img = img.resize((256, 256), Image.Resampling.BILINEAR)

        # Convert PIL to numpy RGB
        img_np = np.array(img.convert("RGB"))

        # 1. CT Intensity normalization
        img_np = ct_intensity_normalize(img_np)

        # 2. Noise suppression
        img_np = apply_noise_suppression(img_np)

        # 3. CLAHE enhancement
        img_np = apply_clahe(img_np, clip_limit=2.0)

        # Convert back to PIL for torchvision geometric augmentations
        img_pil = Image.fromarray(img_np)

        # Geometric & Radiometric Augmentation (Training only, anatomically restrained)
        if self.is_training:
            # Subtle rotation (-10 to +10 degrees)
            angle = float(np.random.uniform(-10.0, 10.0))
            # Minor translation (-5% to +5%)
            max_dx = float(self.target_size[0] * 0.05)
            max_dy = float(self.target_size[1] * 0.05)
            translations = (
                int(np.random.uniform(-max_dx, max_dx)),
                int(np.random.uniform(-max_dy, max_dy)),
            )
            # Minor scale (0.95 to 1.05)
            scale = float(np.random.uniform(0.95, 1.05))

            img_pil = TF.affine(
                img_pil,
                angle=angle,
                translate=translations,
                scale=scale,
                shear=[0.0, 0.0],
                interpolation=TF.InterpolationMode.BILINEAR,
            )

            # Horizontal flip (bilaterally valid for axial cranial CT)
            if np.random.rand() > 0.5:
                img_pil = TF.hflip(img_pil)

            # Subtle brightness / contrast adjustment (+/- 10%)
            brightness_factor = float(np.random.uniform(0.90, 1.10))
            contrast_factor = float(np.random.uniform(0.90, 1.10))
            img_pil = TF.adjust_brightness(img_pil, brightness_factor)
            img_pil = TF.adjust_contrast(img_pil, contrast_factor)

        # Resize to 224x224
        img_pil = TF.resize(img_pil, self.target_size, interpolation=TF.InterpolationMode.BILINEAR)

        # Convert to Tensor and apply normalization
        tensor = TF.to_tensor(img_pil)
        tensor = TF.normalize(tensor, mean=IMAGENET_MEAN, std=IMAGENET_STD)

        # Anti-memorization: Random Erasing during training
        if self.is_training and np.random.rand() < 0.25:
            tensor = TF.erase(
                tensor,
                i=int(np.random.uniform(0.2, 0.7) * self.target_size[1]),
                j=int(np.random.uniform(0.2, 0.7) * self.target_size[0]),
                h=int(np.random.uniform(0.1, 0.25) * self.target_size[1]),
                w=int(np.random.uniform(0.1, 0.25) * self.target_size[0]),
                v=0,
            )

        return tensor


def get_train_transforms(target_size: Tuple[int, int] = (224, 224)) -> MedicalCTTransform:
    """Returns training transformation pipeline with restrained medical augmentations."""
    return MedicalCTTransform(target_size=target_size, is_training=True)


def get_val_test_transforms(target_size: Tuple[int, int] = (224, 224)) -> MedicalCTTransform:
    """Returns deterministic validation/test preprocessing pipeline."""
    return MedicalCTTransform(target_size=target_size, is_training=False)


def preprocess_image_for_inference(
    image_input: Union[str, Image.Image, np.ndarray],
    target_size: Tuple[int, int] = (224, 224),
) -> Tuple[torch.Tensor, np.ndarray, np.ndarray]:
    """Complete inference preprocessing pipeline.

    Returns:
        tensor: [1, 3, 224, 224] normalized tensor ready for model forward pass
        original_rgb: [H, W, 3] uint8 original image array
        preprocessed_rgb: [224, 224, 3] uint8 enhanced image array
    """
    if isinstance(image_input, str):
        pil_img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, np.ndarray):
        if len(image_input.shape) == 2:
            image_input = cv2.cvtColor(image_input, cv2.COLOR_GRAY2RGB)
        pil_img = Image.fromarray(image_input)
    elif isinstance(image_input, Image.Image):
        pil_img = image_input.convert("RGB")
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    original_rgb = np.array(pil_img)

    # Apply CT preprocessing
    img_np = ct_intensity_normalize(original_rgb)
    img_np = apply_noise_suppression(img_np)
    img_np = apply_clahe(img_np, clip_limit=2.0)

    # Resize to target size for display & model
    preprocessed_pil = Image.fromarray(img_np).resize(target_size, Image.Resampling.BILINEAR)
    preprocessed_rgb = np.array(preprocessed_pil)

    # Tensor conversion & normalization
    tensor = TF.to_tensor(preprocessed_pil)
    tensor = TF.normalize(tensor, mean=IMAGENET_MEAN, std=IMAGENET_STD)
    tensor = tensor.unsqueeze(0)  # [1, 3, 224, 224]

    return tensor, original_rgb, preprocessed_rgb
