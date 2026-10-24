# Attention-Enhanced Hybrid CNN–Transformer Network for Robust Brain Tumor Detection in CT Images

[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg?logo=pytorch)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Research_Use_Only-blue.svg)](#medical-safety-and-research-ethics)

A research-grade deep-learning system that analyzes brain CT images, predicts brain-tumor categories, and provides post-hoc confidence calibration, Grad-CAM explainability, multi-baseline evaluation benchmarks, and automated uncertainty rejection.

---

> [!IMPORTANT]
> ### Medical Safety & Research Ethics Disclaimer
> **Research-use system. Model outputs are not a medical diagnosis and should be reviewed by qualified healthcare professionals.**
> This application is strictly an educational decision-support tool. It does not replace radiologists or clinical diagnostic procedures (histopathology, MRI, tissue biopsy). It never claims 100% accuracy or clinical certification.

---

## 1. Architectural Overview

The proposed primary architecture unites localized inductive biases from modern convolutional architectures with global relational modeling from vision transformers:

```
Input Brain CT Image (3 × 224 × 224)
       │
       ▼
Medical Preprocessing (Hounsfield Windowing, Bilateral Filtering, CLAHE)
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
ConvNeXt-Tiny CNN Feature Encoder         Swin Transformer-Tiny Encoder
(Local Receptive Fields: 768 × 7 × 7)     (Shifted Windows: 49 Tokens × 768)
       │                                         │
       ▼                                         │
CBAM Attention Module                            │
(Channel Attention + Spatial Attention)          │
       │                                         │
       ▼                                         ▼
Projection & LayerNorm                   Projection & LayerNorm
       │                                         │
       └───────────────────┬─────────────────────┘
                           ▼
            Bidirectional Cross-Attention Fusion
            & Learnable Gated Token Blending
                           │
                           ▼
               Learnable Attention Pooling
                           │
                           ▼
          LayerNorm + Dropout + Classifier Head
                           │
                           ▼
            Post-Hoc Temperature Scaling (T)
                           │
                           ▼
        Calibrated Probabilities & Grad-CAM Heatmap
```

### Key Architectural Components

1. **Local CNN Feature Encoder (ConvNeXt-Tiny):** Captures high-frequency morphological details, lesion textures, borders, and tissue density transitions. Head stripped to expose $768 \times 7 \times 7$ intermediate feature maps.
2. **CBAM Attention Module:** Applies sequential Channel Attention (shared MLP over AvgPool/MaxPool) followed by Spatial Attention ($7 \times 7$ convolution with Sigmoid) to suppress background air/bone artifacts and emphasize soft-tissue abnormalities.
3. **Global Transformer Encoder (Swin Transformer-Tiny):** Computes shifted-window self-attention across 49 spatial tokens to evaluate bilateral hemispheric symmetry, ventricular midline displacement, and global anatomical context.
4. **Learnable Attention Fusion:** Independent linear projections and LayerNorm for both streams, bidirectional multi-head cross-attention ($CNN \to Swin$ and $Swin \to CNN$), and a learnable sigmoid gating network.
5. **Attention Pooling:** Replaces uniform average pooling with learnable spatial token weighting to prioritize informative lesion patches into a global vector.
6. **Confidence Calibration (Temperature Scaling):** Learns a single positive scalar $T$ on held-out validation logits via L-BFGS minimizing NLL, reducing Expected Calibration Error (ECE) and preventing overconfidence.
7. **Automated Uncertainty Rejection:** Flagging predictions with confidence $< 50\%$ or probability margin $< 0.10$ as `UNCERTAIN` ("Model confidence is insufficient for a reliable automated classification").

---

## 2. Multi-Model Benchmark Baseline Support

Experiments are managed and reproducible in `experiments/<run_id>/`:
- **ResNet-50**
- **EfficientNet-B0**
- **ConvNeXt-Tiny**
- **Swin Transformer-Tiny**
- **Proposed Hybrid CNN-Transformer**

Never automatically declares the proposed architecture superior; reports empirical test set metrics objectively.

---

## 3. Directory Structure

```
brain-tumor-ai/
├── dataset/                     # Partitioned dataset with strict patient isolation
│   ├── train/ (classes...)
│   ├── val/   (classes...)
│   └── test/  (classes...)
├── ml/
│   ├── models/
│   │   ├── attention.py         # CBAM, AttentionFusion, AttentionPooling
│   │   ├── hybrid_model.py      # Proposed Attention-Enhanced Hybrid CNN-Transformer
│   │   ├── resnet.py            # ResNet50 baseline
│   │   ├── efficientnet.py      # EfficientNet-B0 baseline
│   │   ├── convnext.py          # ConvNeXt-Tiny baseline
│   │   └── swin.py              # Swin Transformer-Tiny baseline
│   ├── training/
│   │   ├── trainer.py           # Two-stage transfer learning engine
│   │   ├── losses.py            # CrossEntropy, Weighted CE, Focal Loss
│   │   ├── metrics.py           # Multi-class accuracy, F1, sensitivity, specificity, AUC
│   │   └── callbacks.py         # EarlyStopping, ModelCheckpoint, TrainingLogger
│   ├── calibration/
│   │   └── temperature_scaling.py # Temperature scaling & ECE calculation
│   ├── explainability/
│   │   └── gradcam.py           # Grad-CAM heatmap & overlay generation
│   ├── datasets/
│   │   ├── dataset.py           # Dynamic class discovery & patient leakage validator
│   │   └── sample_generator.py  # High-fidelity realistic CT scan generator
│   └── utils/
│       ├── preprocessing.py     # CLAHE, intensity windowing, bilateral noise filter
│       └── visualization.py     # Confusion matrix, ROC, and training curve plots
├── backend/
│   └── app/
│       ├── main.py              # FastAPI application & model caching lifespan
│       ├── api/endpoints.py     # /api/predict, /api/model-info, /api/experiments, etc.
│       ├── services/            # InferenceService, ExperimentService
│       └── schemas/             # Pydantic request/response models
├── frontend/                    # Vite + React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── pages/               # Dashboard, CTAnalyzer, ModelPerformance, Experiments, About
│   │   └── components/          # Navbar, Sidebar, MedicalDisclaimer
├── experiments/                 # Reproducible experiment runs with artifacts & weights
├── tests/                       # Complete pytest unit and integration test suite
├── train.py                     # Training CLI
├── evaluate.py                  # Evaluation CLI
├── predict.py                   # Single-image inference CLI
├── run_benchmarks.py            # Multi-model benchmarking script
└── requirements.txt             # Python dependencies
```

---

## 4. Quick Start

### Installation

1. Clone repository and install Python dependencies:
   ```bash
   pip install -r brain-tumor-ai/requirements.txt
   ```

2. Install Frontend dependencies:
   ```bash
   cd brain-tumor-ai/frontend
   npm install
   npm run build
   cd ../..
   ```

---

## 5. CLI Execution

### A. Dataset Generation (Optional)
If you do not have an existing CT dataset, generate a high-fidelity synthetic benchmark dataset:
```bash
python brain-tumor-ai/ml/datasets/sample_generator.py brain-tumor-ai/dataset
```

### B. Model Training (`train.py`)
Train any baseline or the proposed hybrid model:
```bash
# Proposed Hybrid CNN-Transformer
python brain-tumor-ai/train.py --model hybrid --epochs 25 --batch_size 16 --learning_rate 0.0001

# Baselines
python brain-tumor-ai/train.py --model resnet50 --epochs 20 --batch_size 16
python brain-tumor-ai/train.py --model efficientnet_b0 --epochs 20 --batch_size 16
python brain-tumor-ai/train.py --model convnext_tiny --epochs 20 --batch_size 16
python brain-tumor-ai/train.py --model swin_t --epochs 20 --batch_size 16
```

### C. Held-Out Evaluation (`evaluate.py`)
Evaluate a trained model checkpoint on the test partition:
```bash
python brain-tumor-ai/evaluate.py --checkpoint brain-tumor-ai/experiments/hybrid_proposed
```
Outputs:
- `metrics.json` (Accuracy, Balanced Accuracy, Precision, Recall, Specificity, F1, ROC-AUC, Latency)
- `confusion_matrix.png`
- `roc_curve.png`

### D. Single-Image Inference (`predict.py`)
```bash
python brain-tumor-ai/predict.py \
  --image brain-tumor-ai/dataset/test/glioma/pat_077_slice_01.png \
  --checkpoint brain-tumor-ai/experiments/hybrid_proposed \
  --output_dir brain-tumor-ai/backend/static/outputs
```

Output:
```json
{
  "predicted_class": "glioma",
  "raw_probability": 0.4444,
  "calibrated_confidence": 0.3580,
  "confidence_status": "UNCERTAIN",
  "rejection_message": "Model confidence is insufficient for a reliable automated classification.",
  "uncertainty_metrics": {
    "margin": 0.1034,
    "entropy": 1.3428,
    "temperature": 1.7583
  },
  "class_probabilities": {
    "glioma": 0.3580,
    "meningioma": 0.1517,
    "no_tumor": 0.2545,
    "pituitary": 0.2358
  },
  "gradcam_label": "Model attention / influential region",
  "original_path": "...",
  "heatmap_path": "...",
  "overlay_path": "..."
}
```

---

## 6. Running the Web Application

### Step 1: Start FastAPI Backend
```bash
python -m uvicorn backend.app.main:app --app-dir brain-tumor-ai --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### Step 2: Start React Frontend
In a separate terminal:
```bash
cd brain-tumor-ai/frontend
npm run dev
```
Open your browser at: `http://localhost:5173/`

---

## 7. Running the Test Suite

Run the full pytest suite covering dataset discovery, patient isolation, CLAHE preprocessing, model forward passes, temperature scaling, API routes, and end-to-end inference:
```bash
python -m pytest brain-tumor-ai/tests -v
```

---

## 8. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/predict` | Upload CT image, run preprocessing, inference, calibration, and Grad-CAM |
| `GET` | `/api/model-info` | Returns active model parameter count, device, classes, and temperature |
| `GET` | `/api/classes` | Returns dynamically discovered target classes |
| `GET` | `/api/health` | Health status and device telemetry |
| `GET` | `/api/metrics` | Test metrics of active model |
| `GET` | `/api/experiments` | Benchmark matrix comparing all baseline runs |
| `GET` | `/api/experiments/{run_id}` | Full artifact details for an experiment run |
| `POST` | `/api/select-model` | Switches the cached active model checkpoint in memory |

---

## 9. Research Citations

- **ConvNeXt:** Liu, Z., et al. (2022). *A ConvNet for the 2020s*. CVPR.
- **Swin Transformer:** Liu, Z., et al. (2021). *Swin Transformer: Hierarchical Vision Transformer using Shifted Windows*. ICCV.
- **CBAM:** Woo, S., et al. (2018). *CBAM: Convolutional Block Attention Module*. ECCV.
- **Temperature Scaling:** Guo, C., et al. (2017). *On Calibration of Modern Neural Networks*. ICML.
- **Grad-CAM:** Selvaraju, R. R., et al. (2017). *Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization*. ICCV.
