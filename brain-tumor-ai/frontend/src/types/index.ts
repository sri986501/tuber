export type PageTab =
  | 'dashboard'
  | 'analyzer'
  | 'performance'
  | 'experiments'
  | 'about'
  | 'models'
  | 'dataset';

export type ConfidenceStatus = 'HIGH CONFIDENCE' | 'MODERATE CONFIDENCE' | 'LOW CONFIDENCE' | 'UNCERTAIN';

export interface UncertaintyMetrics {
  margin: number;
  entropy: number;
  temperature: number;
}

export interface ExplanationDetails {
  local_cnn_features: string;
  global_transformer_features: string;
  attention_mechanism: string;
  confidence_calibration: string;
}

export interface LesionAnalysis {
  estimated_location: string;
  attenuation_profile: string;
  edema_profile: string;
  mass_effect: string;
  peak_coordinates: { x: number; y: number };
  estimated_density_hu: number;
  estimated_volume_cm3?: number;
  midline_shift_mm?: number;
}

export interface PredictionResult {
  predicted_class: string;
  raw_probability: number;
  calibrated_confidence: number;
  confidence_status: ConfidenceStatus;
  rejection_message?: string | null;
  uncertainty_metrics: UncertaintyMetrics;
  class_probabilities: Record<string, number>;
  gradcam_label: string;
  original_url?: string;
  heatmap_url?: string;
  overlay_url?: string;
  explanation: ExplanationDetails;
  model_version: string;
  medical_disclaimer: string;
  lesion_analysis?: LesionAnalysis;
  clinical_recommendations?: string[];
  urgency_level?: string;
  who_grade_category?: string;
}

export interface AvailableModel {
  run_id: string;
  model_name: string;
  domain: string;
  classes: string[];
  is_active: boolean;
  checkpoint_path: string;
}

export interface ModelInfo {
  model_name: string;
  num_classes: number;
  classes: string[];
  total_parameters: number;
  device: string;
  temperature: number;
  checkpoint_path: string;
  is_calibrated: boolean;
}

export interface ClassPerformance {
  precision: number;
  recall: number;
  specificity: number;
  f1_score: number;
  support: number;
}

export interface ModelMetrics {
  model_name?: string;
  accuracy: number;
  balanced_accuracy: number;
  precision_macro: number;
  precision_weighted: number;
  recall_macro: number;
  recall_weighted: number;
  sensitivity: number;
  specificity_macro: number;
  f1_macro: number;
  f1_weighted: number;
  roc_auc_macro?: number;
  roc_auc_weighted?: number;
  confusion_matrix: number[][];
  per_class: Record<string, ClassPerformance>;
  class_names: string[];
  total_parameters?: number;
  mean_inference_time_ms?: number;
  ece_raw?: number;
  ece_calibrated?: number;
  test_samples_count?: number;
}

export interface ExperimentSummary {
  run_id: string;
  model_name: string;
  accuracy: number;
  balanced_accuracy: number;
  precision_macro: number;
  recall_macro: number;
  specificity_macro: number;
  f1_macro: number;
  roc_auc_macro: number;
  total_parameters: number;
  mean_inference_time_ms: number;
  ece_calibrated: number;
  created_at?: string;
  is_active: boolean;
  checkpoint_path: string;
  has_metrics: boolean;
  confusion_matrix_url?: string;
  roc_curve_url?: string;
  training_curves_url?: string;
}
