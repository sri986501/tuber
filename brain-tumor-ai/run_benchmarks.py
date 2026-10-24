"""Benchmark runner to train and evaluate all baseline models and the proposed hybrid model.

Models:
1. ResNet50
2. EfficientNet-B0
3. ConvNeXt-Tiny
4. Swin Transformer-Tiny
5. Proposed Hybrid CNN-Transformer
"""

import subprocess
import sys
from pathlib import Path

MODELS = [
    ("resnet50", "experiments/resnet50_baseline", 2),
    ("efficientnet_b0", "experiments/efficientnet_b0_baseline", 2),
    ("convnext_tiny", "experiments/convnext_tiny_baseline", 2),
    ("swin_t", "experiments/swin_t_baseline", 2),
]


def run_pipeline():
    project_dir = Path(__file__).parent.resolve()

    for model_name, out_dir, epochs in MODELS:
        out_p = project_dir / out_dir
        if (out_p / "metrics.json").exists():
            print(f"Skipping {model_name}, already evaluated.")
            continue

        print(f"\n==========================================")
        print(f"Benchmarking Model: {model_name.upper()}")
        print(f"==========================================")

        # 1. Train
        train_cmd = [
            sys.executable,
            str(project_dir / "train.py"),
            "--model", model_name,
            "--epochs", str(epochs),
            "--batch_size", "16",
            "--output_dir", str(out_p),
        ]
        print(f"Running: {' '.join(train_cmd)}")
        res_train = subprocess.run(train_cmd, cwd=str(project_dir))
        if res_train.returncode != 0:
            print(f"Error training {model_name}, exiting.")
            continue

        # 2. Evaluate
        eval_cmd = [
            sys.executable,
            str(project_dir / "evaluate.py"),
            "--checkpoint", str(out_p / "best_model.pth"),
        ]
        print(f"Running: {' '.join(eval_cmd)}")
        res_eval = subprocess.run(eval_cmd, cwd=str(project_dir))
        if res_eval.returncode != 0:
            print(f"Error evaluating {model_name}.")


if __name__ == "__main__":
    run_pipeline()
