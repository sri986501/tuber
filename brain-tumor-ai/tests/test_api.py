"""Integration and endpoint tests for FastAPI backend."""

import io
import sys
from pathlib import Path
import numpy as np
from PIL import Image
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.app.main import app
from backend.app.services.inference_service import InferenceService


@pytest.fixture(scope="module")
def client():
    # Ensure a model is loaded in InferenceService for testing
    exp_dir = Path("brain-tumor-ai/experiments/hybrid_proposed")
    if (exp_dir / "best_model.pth").exists():
        InferenceService.get_instance(default_checkpoint=str(exp_dir / "best_model.pth"))
    with TestClient(app) as test_client:
        yield test_client


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "medical_disclaimer" in data


def test_model_info_endpoint(client):
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "total_parameters" in data


def test_classes_endpoint(client):
    response = client.get("/api/classes")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data
    assert len(data["classes"]) >= 2


def test_experiments_endpoint(client):
    response = client.get("/api/experiments")
    assert response.status_code == 200
    data = response.json()
    assert "experiments" in data
    assert len(data["experiments"]) >= 1


def test_integration_upload_prediction(client):
    """End-to-end integration test:

    Upload image -> Backend -> Calibrated Prediction & Grad-CAM -> JSON Result
    """
    # Create synthetic test scan in memory
    img = Image.new("RGB", (224, 224), color=(100, 100, 100))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("test_scan.png", buf, "image/png")},
    )

    assert response.status_code == 200
    data = response.json()

    # Verify structured fields
    assert "predicted_class" in data
    assert "calibrated_confidence" in data
    assert "raw_probability" in data
    assert "confidence_status" in data
    assert "uncertainty_metrics" in data
    assert "class_probabilities" in data
    assert "explanation" in data
    assert "medical_disclaimer" in data
    assert data["gradcam_label"] == "Model attention / influential region"
