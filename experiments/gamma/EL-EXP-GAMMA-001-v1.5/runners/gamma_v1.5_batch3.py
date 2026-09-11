#!/usr/bin/env python3
"""Run EL-EXP-GAMMA-001 v1.5 Seeds 21-30 only and save Batch 3 statistics."""

import importlib.util
from pathlib import Path


script_directory = Path(__file__).resolve().parent
module_path = script_directory / "gamma_v1.5_batch1.py"
module_specification = importlib.util.spec_from_file_location(
    "gamma_v1_5_batch_runner",
    module_path,
)
if module_specification is None or module_specification.loader is None:
    raise RuntimeError(f"Unable to load batch runner: {module_path}")
batch_runner = importlib.util.module_from_spec(module_specification)
module_specification.loader.exec_module(batch_runner)

batch_runner.BATCH_SEEDS = list(range(21, 31))
batch_runner.BATCH_NUMBER = 3
batch_runner.KNOWN_PILOT_SEED_OVERLAP = []
batch_runner.OUTPUT_PATH = script_directory.parent / "results" / "gamma_v1.5_batch3.json"


if __name__ == "__main__":
    batch_runner.main()
