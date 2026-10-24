"""Model training engine with Two-Stage Transfer Learning, Mixed Precision, and Early Stopping."""

import os
import random
from contextlib import nullcontext
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import torch
import torch.nn as nn
from torch.cuda.amp import GradScaler, autocast
from torch.utils.data import DataLoader

from ml.models import build_model
from ml.training.callbacks import EarlyStopping, ModelCheckpoint, TrainingLogger
from ml.training.losses import build_loss
from ml.training.metrics import calculate_metrics


def set_seed(seed: int = 42):
    """Ensures deterministic experiment reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


class Trainer:
    """Orchestrates model training, validation, stage transitions, and checkpointing."""

    def __init__(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        val_loader: DataLoader,
        class_names: List[str],
        device: torch.device,
        output_dir: str,
        loss_type: str = "ce",
        focal_gamma: float = 2.0,
        learning_rate: float = 1e-4,
        backbone_lr: float = 1e-5,
        weight_decay: float = 1e-2,
        stage2_epoch: int = 10,
        use_amp: bool = True,
        clip_grad_norm: float = 1.0,
        early_stopping_patience: int = 15,
        selection_metric: str = "f1_macro",
    ):
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.class_names = class_names
        self.num_classes = len(class_names)
        self.device = device
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.loss_type = loss_type
        self.learning_rate = learning_rate
        self.backbone_lr = backbone_lr
        self.weight_decay = weight_decay
        self.stage2_epoch = stage2_epoch
        self.use_amp = use_amp and (device.type == "cuda")
        self.clip_grad_norm = clip_grad_norm
        self.selection_metric = selection_metric

        # Compute balanced class weights for training to handle imbalance
        counts = [0] * self.num_classes
        if hasattr(self.train_loader.dataset, "samples"):
            for _, label in self.train_loader.dataset.samples:
                counts[label] += 1
            total_s = max(sum(counts), 1)
            weights = [total_s / (self.num_classes * max(c, 1)) for c in counts]
            self.class_weights = torch.tensor(weights, dtype=torch.float32).to(device)
            print(f"[Trainer] Balanced class weights: {self.class_weights.cpu().numpy().round(3).tolist()}")
        else:
            self.class_weights = None

        # Build loss criterion
        self.criterion = build_loss(
            loss_type=loss_type, class_weights=self.class_weights, focal_gamma=focal_gamma
        ).to(device)

        # Scaler for mixed precision
        self.scaler = torch.amp.GradScaler("cuda", enabled=self.use_amp)

        # Callbacks
        self.checkpoint = ModelCheckpoint(str(self.output_dir))
        mode = "min" if selection_metric == "val_loss" else "max"
        self.early_stopping = EarlyStopping(
            patience=early_stopping_patience,
            mode=mode,
            verbose=True,
        )
        self.logger = TrainingLogger(str(self.output_dir / "training_history.json"))

        # Optimizer setup for Stage 1 (Backbones frozen if hybrid)
        self._init_stage1_optimizer()

    def _init_stage1_optimizer(self):
        """Stage 1: Freeze backbones, train only classifier and fusion heads."""
        if hasattr(self.model, "freeze_backbones"):
            self.model.freeze_backbones()
            print("[Stage 1] Pretrained backbones frozen. Training heads & fusion.")

        # Trainable parameters only
        trainable_params = [p for p in self.model.parameters() if p.requires_grad]
        self.optimizer = torch.optim.AdamW(
            trainable_params,
            lr=self.learning_rate,
            weight_decay=self.weight_decay,
        )

    def _init_stage2_optimizer(self, remaining_epochs: int):
        """Stage 2: Differential LR fine-tuning (backbones 1e-5, classifier 1e-4)."""
        if hasattr(self.model, "unfreeze_upper_layers"):
            self.model.unfreeze_upper_layers()
            print("[Stage 2] Unfreezing upper layers with differential learning rates.")

        # Identify parameter groups
        backbone_params = []
        head_params = []

        for name, param in self.model.named_parameters():
            if not param.requires_grad:
                continue
            if "classifier" in name or "head" in name or "fusion" in name or "attn_pool" in name:
                head_params.append(param)
            else:
                backbone_params.append(param)

        param_groups = [
            {"params": head_params, "lr": self.learning_rate},
        ]
        if backbone_params:
            param_groups.append({"params": backbone_params, "lr": self.backbone_lr})

        self.optimizer = torch.optim.AdamW(param_groups, weight_decay=self.weight_decay)
        self.scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
            self.optimizer, T_max=max(1, remaining_epochs), eta_min=1e-6
        )

    def train_epoch(self) -> Tuple[float, float, float]:
        """Trains for a single epoch."""
        self.model.train()
        total_loss = 0.0
        all_preds = []
        all_targets = []

        for images, targets, _ in self.train_loader:
            images = images.to(self.device, non_blocking=True)
            targets = targets.to(self.device, non_blocking=True)

            self.optimizer.zero_grad()

            context = torch.amp.autocast("cuda") if self.use_amp else torch.no_grad() if False else nullcontext()
            with context:
                logits = self.model(images)
                loss = self.criterion(logits, targets)

            self.scaler.scale(loss).backward()

            if self.clip_grad_norm > 0:
                self.scaler.unscale_(self.optimizer)
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), self.clip_grad_norm)

            self.scaler.step(self.optimizer)
            self.scaler.update()

            total_loss += loss.item() * images.size(0)
            preds = torch.argmax(logits, dim=1).detach().cpu().numpy()
            all_preds.extend(preds)
            all_targets.extend(targets.cpu().numpy())

        avg_loss = total_loss / len(self.train_loader.dataset)
        metrics = calculate_metrics(np.array(all_targets), np.array(all_preds), class_names=self.class_names)
        return avg_loss, metrics["accuracy"], metrics["f1_macro"]

    @torch.no_grad()
    def evaluate(self, data_loader: DataLoader) -> Tuple[float, Dict[str, Any], torch.Tensor, torch.Tensor]:
        """Evaluates on validation or test split and gathers logits for calibration."""
        self.model.eval()
        total_loss = 0.0
        all_logits = []
        all_targets = []

        for images, targets, _ in data_loader:
            images = images.to(self.device, non_blocking=True)
            targets = targets.to(self.device, non_blocking=True)

            logits = self.model(images)
            loss = self.criterion(logits, targets)

            total_loss += loss.item() * images.size(0)
            all_logits.append(logits.cpu())
            all_targets.append(targets.cpu())

        avg_loss = total_loss / len(data_loader.dataset)
        cat_logits = torch.cat(all_logits, dim=0)
        cat_targets = torch.cat(all_targets, dim=0)

        probs = torch.softmax(cat_logits, dim=1).numpy()
        preds = np.argmax(probs, axis=1)

        metrics = calculate_metrics(
            cat_targets.numpy(),
            preds,
            y_prob=probs,
            class_names=self.class_names,
        )
        return avg_loss, metrics, cat_logits, cat_targets

    def train(self, total_epochs: int = 30) -> Dict[str, Any]:
        """Executes full training pipeline across Stage 1 and Stage 2."""
        # Initial Stage 1 scheduler
        stage1_len = min(self.stage2_epoch, total_epochs)
        self.scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
            self.optimizer, T_max=max(1, stage1_len), eta_min=1e-6
        )

        best_score = float("-inf") if self.selection_metric != "val_loss" else float("inf")
        best_val_metrics: Dict[str, Any] = {}
        val_logits_best = None
        val_targets_best = None

        print(f"Beginning training on device [{self.device}] for {total_epochs} epochs.")
        print(f"Model selection metric: [{self.selection_metric}]")

        for epoch in range(1, total_epochs + 1):
            # Transition to Stage 2 if configured
            if epoch == self.stage2_epoch + 1:
                remaining = total_epochs - self.stage2_epoch
                self._init_stage2_optimizer(remaining_epochs=remaining)

            train_loss, train_acc, train_f1 = self.train_epoch()
            val_loss, val_metrics, val_logits, val_targets = self.evaluate(self.val_loader)

            val_acc = val_metrics["accuracy"]
            val_f1 = val_metrics["f1_macro"]

            current_lr = self.optimizer.param_groups[0]["lr"]
            self.scheduler.step()

            # Logging
            self.logger.log_epoch(
                epoch=epoch,
                train_loss=train_loss,
                val_loss=val_loss,
                train_acc=train_acc,
                val_acc=val_acc,
                train_f1=train_f1,
                val_f1=val_f1,
                lr=current_lr,
            )

            # Check if this is the best model so far
            current_score = val_loss if self.selection_metric == "val_loss" else val_f1
            is_best = False
            if self.selection_metric == "val_loss":
                if current_score < best_score:
                    best_score = current_score
                    is_best = True
            else:
                if current_score > best_score:
                    best_score = current_score
                    is_best = True

            if is_best:
                best_val_metrics = val_metrics
                val_logits_best = val_logits
                val_targets_best = val_targets

            self.checkpoint.save_checkpoint(
                model=self.model,
                optimizer=self.optimizer,
                epoch=epoch,
                metrics=val_metrics,
                is_best=is_best,
            )

            print(
                f"Epoch [{epoch:02d}/{total_epochs:02d}] "
                f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | "
                f"Train F1: {train_f1:.4f} | Val F1: {val_f1:.4f} | "
                f"Val Acc: {val_acc:.4f} {'[BEST]' if is_best else ''}",
                flush=True,
            )

            # Early stopping check
            if self.early_stopping(current_score):
                pass
            if self.early_stopping.early_stop:
                print(f"[EarlyStopping] Triggered at epoch {epoch}. Terminating early.")
                break

        return {
            "best_score": best_score,
            "best_val_metrics": best_val_metrics,
            "val_logits": val_logits_best if val_logits_best is not None else val_logits,
            "val_targets": val_targets_best if val_targets_best is not None else val_targets,
        }
