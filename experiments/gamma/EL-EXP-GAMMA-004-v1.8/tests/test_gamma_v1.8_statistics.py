#!/usr/bin/env python3
"""Non-evidentiary deterministic tests for the v1.8 aggregator."""

import importlib.util
from pathlib import Path


path = Path(__file__).resolve().parents[1] / "runners" / "gamma_v1_8_aggregate.py"
spec = importlib.util.spec_from_file_location("aggregate", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

checks = [
    ("exact sign test all positive", module.sign_test([1.0] * 30)["twoSidedPValue"] == 2 / 2 ** 30),
    ("exact sign test balanced", module.sign_test([1.0] * 15 + [-1.0] * 15)["twoSidedPValue"] == 1.0),
    ("four primary comparisons frozen", module.ALPHA == 0.05 / 4 and len(module.COMPARATORS) == 4),
    ("thirty candidate seeds frozen", len(module.SEEDS) == 30 and len(set(module.SEEDS)) == 30),
]
for name, passed in checks:
    print(("PASS" if passed else "FAIL"), name)
if not all(passed for _, passed in checks):
    raise SystemExit(1)
print(f"Summary: {sum(passed for _, passed in checks)} / {len(checks)} PASS")
