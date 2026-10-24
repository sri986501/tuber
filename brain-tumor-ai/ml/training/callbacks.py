"""Training callbacks for early stopping, checkpointing, and metric logging."""

import json
from pathlib import Path
from typing import Any, Dict, Optional
import torch


class EarlyStopping:
    """Early stopping to prevent overfitting on validation loss or validation F1."""

    def __init__(
        self,
        patience: int = 10,
        min_delta: float = 1e-4,
        mode: str = "max",
        verbose: bool = True,
    ):
        self.patience = patience
        self.min_delta = min_delta
        self.mode = mode
        self.verbose = verbose
        self.counter = 0
        self.best_score: Optional[float] = None
        self.early_stop = False

    def __call__(self, current_score: float) -> bool:
        if self.best_score is None:
            self.best_score = current_score
            return True

        if self.mode == "max":
            improved = current_score > self.best_score + self.min_delta
        else:
            improved = current_score < self.best_score - self.min_delta

        if improved:
            self.best_score = current_score
            self.counter = 0
            return True
        else:
            self.counter += 1
            if self.verbose:
                print(f"[EarlyStopping] No improvement for {self.counter}/{self.patience} epochs.")
            if self.counter >= self.patience:
                self.early_stop = True
            return False


class ModelCheckpoint:
    """Saves best and latest model checkpoints along with training metadata."""

    def __init__(self, checkpoint_dir: str):
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        self.best_model_path = self.checkpoint_dir / "best_model.pth"
        self.last_model_path = self.checkpoint_dir / "last_model.pth"

    def save_checkpoint(
        self,
        model: torch.nn.Module,
        optimizer: torch.optim.Optimizer,
        epoch: int,
        metrics: Dict[str, Any],
        is_best: bool = False,
    ):
        state = {
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "metrics": metrics,
        }
        torch.save(state, self.last_model_path)
        if is_best:
            torch.save(state, self.best_model_path)


class TrainingLogger:
    """Records epoch-by-epoch training and validation dynamics."""

    def __init__(self, log_path: str):
        self.log_path = Path(log_path)
        self.history = {
            "epoch": [],
            "train_loss": [],
            "val_loss": [],
            "train_acc": [],
            "val_acc": [],
            "train_f1": [],
            "val_f1": [],
            "learning_rate": [],
        }

    def log_epoch(
        self,
        epoch: int,
        train_loss: float,
        val_loss: float,
        train_acc: float,
        val_acc: float,
        train_f1: float,
        val_f1: float,
        lr: float,
    ):
        self.history["epoch"].append(epoch)
        self.history["train_loss"].append(float(train_loss))
        self.history["val_loss"].append(float(val_loss))
        self.history["train_acc"].append(float(train_acc))
        self.history["val_acc"].append(float(val_acc))
        self.history["train_f1"].append(float(train_f1))
        self.history["val_f1"].append(float(val_f1))
        self.history["learning_rate"].append(float(lr))

        with open(self.log_path, "w") as f:
            json.dump(self.history, f, indent=2)
