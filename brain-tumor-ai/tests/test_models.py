"""Unit tests for model forward passes, attention modules, and architectures."""

import sys
from pathlib import Path
import pytest
import torch

sys.path.insert(0, str(Path(__file__).parent.parent))

from ml.models.attention import CBAM, AttentionFusion, AttentionPooling
from ml.models import build_model


def test_cbam_forward():
    cbam = CBAM(in_channels=64, reduction_ratio=8, kernel_size=7)
    x = torch.randn(2, 64, 14, 14)
    out = cbam(x)
    assert out.shape == x.shape


def test_attention_fusion_forward():
    fusion = AttentionFusion(cnn_dim=128, transformer_dim=128, embed_dim=64, num_heads=4)
    cnn_tokens = torch.randn(2, 16, 128)
    trans_tokens = torch.randn(2, 16, 128)
    fused = fusion(cnn_tokens, trans_tokens)
    assert fused.shape == (2, 16, 64)


def test_attention_pooling_forward():
    pool = AttentionPooling(embed_dim=64, hidden_dim=32)
    tokens = torch.randn(2, 16, 64)
    pooled = pool(tokens)
    assert pooled.shape == (2, 64)


@pytest.mark.parametrize("model_name", ["hybrid", "resnet50", "efficientnet_b0", "convnext_tiny", "swin_t"])
def test_all_models_forward(model_name):
    model = build_model(model_name=model_name, num_classes=4, pretrained=False)
    x = torch.randn(2, 3, 224, 224)
    logits = model(x)
    assert logits.shape == (2, 4)
