"""Model registry and factory for Brain Tumor Detection architectures."""

import torch.nn as nn
from ml.models.hybrid_model import AttentionEnhancedHybridModel
from ml.models.resnet import ResNet50Baseline
from ml.models.efficientnet import EfficientNetB0Baseline
from ml.models.convnext import ConvNeXtTinyBaseline
from ml.models.swin import SwinTinyBaseline

MODEL_REGISTRY = {
    "hybrid": AttentionEnhancedHybridModel,
    "resnet50": ResNet50Baseline,
    "efficientnet_b0": EfficientNetB0Baseline,
    "convnext_tiny": ConvNeXtTinyBaseline,
    "swin_t": SwinTinyBaseline,
}


def build_model(model_name: str, num_classes: int = 4, pretrained: bool = False, **kwargs) -> nn.Module:
    """Factory function to build a brain tumor classification model.

    Args:
        model_name: One of 'hybrid', 'resnet50', 'efficientnet_b0', 'convnext_tiny', 'swin_t'
        num_classes: Number of classification targets
        pretrained: Whether to initialize with ImageNet pretrained backbones
    """
    normalized_name = model_name.lower().strip()
    if normalized_name not in MODEL_REGISTRY:
        raise ValueError(
            f"Unknown model architecture: '{model_name}'. "
            f"Supported models: {list(MODEL_REGISTRY.keys())}"
        )
    model_class = MODEL_REGISTRY[normalized_name]
    return model_class(num_classes=num_classes, pretrained=pretrained, **kwargs)
