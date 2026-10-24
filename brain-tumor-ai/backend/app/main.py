"""FastAPI Application Entrypoint for Brain CT Tumor Detection System."""

from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.api.endpoints import router as api_router
from backend.app.services.inference_service import InferenceService

ROOT_DIR = Path(__file__).resolve().parent.parent.parent


def find_default_checkpoint() -> str:
    """Finds the best available model checkpoint to load at startup."""
    exp_root = ROOT_DIR / "experiments"
    if not exp_root.exists():
        return ""

    # Priority 1: convnext_tiny_baseline (Brain Tumor Network: glioma, meningioma, pituitary, no_tumor)
    convnext_path = exp_root / "convnext_tiny_baseline" / "best_model.pth"
    if convnext_path.exists():
        return str(convnext_path)

    # Priority 2: hybrid_proposed (Neurovascular: Bleeding, Ischemia, Normal)
    hybrid_path = exp_root / "hybrid_proposed" / "best_model.pth"
    if hybrid_path.exists():
        return str(hybrid_path)

    # Priority 3: any experiment with best_model.pth
    for exp_dir in sorted(exp_root.iterdir(), reverse=True):
        if exp_dir.is_dir() and (exp_dir / "best_model.pth").exists():
            return str(exp_dir / "best_model.pth")

    return ""


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: Caches the deep learning model once during startup."""
    print("=" * 60)
    print("Starting Brain CT Classification Service...")
    chk = find_default_checkpoint()
    if chk:
        try:
            inference_service = InferenceService.get_instance(default_checkpoint=chk)
            print(f"Successfully cached model from: {chk}")
        except Exception as e:
            print(f"[WARNING] Failed to load checkpoint {chk}: {e}")
    else:
        print("[NOTICE] No trained checkpoint detected yet in experiments/. Please run train.py.")
    print("Backend ready to serve requests.")
    print("=" * 60)
    yield
    print("Shutting down Brain CT Classification Service...")


app = FastAPI(
    title="Attention-Enhanced Hybrid CNN–Transformer Network for Brain Tumor Detection",
    description="Research-grade decision-support API for Brain CT classification and explainability.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file mounts
outputs_dir = ROOT_DIR / "backend" / "static" / "outputs"
outputs_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/outputs", StaticFiles(directory=str(outputs_dir)), name="outputs")

experiments_dir = ROOT_DIR / "experiments"
experiments_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/experiments", StaticFiles(directory=str(experiments_dir)), name="experiments")

# Include API Router
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "title": "Attention-Enhanced Hybrid CNN–Transformer Network for Robust Brain Tumor Detection in CT Images",
        "purpose": "Educational and research decision support",
        "api_docs": "/docs",
        "endpoints": {
            "predict": "POST /api/predict",
            "model_info": "GET /api/model-info",
            "classes": "GET /api/classes",
            "metrics": "GET /api/metrics",
            "experiments": "GET /api/experiments",
            "health": "GET /api/health",
        },
        "disclaimer": (
            "Research-use system. Model outputs are not a medical diagnosis "
            "and should be reviewed by qualified healthcare professionals."
        ),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
