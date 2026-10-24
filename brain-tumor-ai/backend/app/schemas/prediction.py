"""Pydantic schemas for API requests and structured prediction responses."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class UncertaintyMetrics(BaseModel):
    margin: float = Field(..., description="Difference between top 2 class probabilities")
    entropy: float = Field(..., description="Normalized prediction Shannon entropy")
    temperature: float = Field(..., description="Temperature scaling factor applied")


class ExplanationDetails(BaseModel):
    local_cnn_features: str = Field(..., description="ConvNeXt feature contribution")
    global_transformer_features: str = Field(..., description="Swin Transformer global context")
    attention_mechanism: str = Field(..., description="CBAM and cross-attention fusion analysis")
    confidence_calibration: str = Field(..., description="Temperature scaling rationale")


class PredictionResponse(BaseModel):
    predicted_class: str
    raw_probability: float
    calibrated_confidence: float
    confidence_status: str  # HIGH CONFIDENCE, MODERATE CONFIDENCE, LOW CONFIDENCE, UNCERTAIN
    rejection_message: Optional[str] = None
    uncertainty_metrics: UncertaintyMetrics
    class_probabilities: Dict[str, float]
    gradcam_label: str
    original_url: Optional[str] = None
    heatmap_url: Optional[str] = None
    overlay_url: Optional[str] = None
    explanation: ExplanationDetails
    model_version: str
    medical_disclaimer: str
    lesion_analysis: Optional[Dict[str, Any]] = None
    clinical_recommendations: Optional[List[str]] = None
    urgency_level: Optional[str] = None
    who_grade_category: Optional[str] = None


class ModelInfoResponse(BaseModel):
    model_name: str
    num_classes: int
    classes: List[str]
    total_parameters: int
    device: str
    temperature: float
    checkpoint_path: str
    is_calibrated: bool


class ExperimentSummary(BaseModel):
    run_id: str
    model_name: str
    accuracy: float
    balanced_accuracy: float
    precision_macro: float
    recall_macro: float
    specificity_macro: float
    f1_macro: float
    roc_auc_macro: float
    total_parameters: int
    mean_inference_time_ms: float
    ece_calibrated: float
    created_at: Optional[str] = None
    is_active: bool = False
