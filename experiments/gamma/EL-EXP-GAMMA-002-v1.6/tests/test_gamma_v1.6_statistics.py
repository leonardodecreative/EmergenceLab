#!/usr/bin/env python3
"""Deterministic tests for Gamma v1.6 batch and aggregation statistics."""

from __future__ import annotations

import importlib.util
import math
from pathlib import Path


EXPERIMENT_DIRECTORY = Path(__file__).resolve().parents[1]


def load_module(name: str, relative_path: str):
    module_path = EXPERIMENT_DIRECTORY / relative_path
    specification = importlib.util.spec_from_file_location(name, module_path)
    if specification is None or specification.loader is None:
        raise RuntimeError(f"Unable to load {module_path}")
    module = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(module)
    return module


def assert_close(actual: float, expected: float, tolerance: float = 1.0e-15) -> None:
    if not math.isclose(actual, expected, rel_tol=0.0, abs_tol=tolerance):
        raise AssertionError(f"Expected {expected}; received {actual}")


def main() -> None:
    batch = load_module("gamma_batch", "runners/gamma_v1.6_batch.py")
    aggregate = load_module("gamma_aggregate", "runners/gamma_v1.6_aggregate.py")

    assert len(batch.CONFIRMATORY_SEEDS) == 30
    assert len(set(batch.CONFIRMATORY_SEEDS)) == 30
    assert batch.seeds_for_batch(1) + batch.seeds_for_batch(2) + batch.seeds_for_batch(3) == batch.CONFIRMATORY_SEEDS
    assert batch.CONFIRMATORY_SEEDS == aggregate.CONFIRMATORY_SEEDS

    twenty_two_positive = [1.0] * 22 + [-1.0] * 8
    sign_result = aggregate.exact_two_sided_sign_test(twenty_two_positive)
    assert sign_result["positive"] == 22
    assert sign_result["negative"] == 8
    assert sign_result["effectiveN"] == 30
    assert sign_result["direction"] == "positive"
    assert sign_result["rejectAtAlpha0.05"] is True
    assert_close(sign_result["twoSidedPValue"], 0.016124801710247993)

    all_positive = aggregate.exact_two_sided_sign_test([1.0] * 30)
    assert_close(all_positive["twoSidedPValue"], 1.862645149230957e-09)

    all_ties = aggregate.exact_two_sided_sign_test([0.0] * 30)
    assert all_ties["effectiveN"] == 0
    assert all_ties["twoSidedPValue"] == 1.0

    rounded = aggregate.round_floats({"b": 0.12345678901249, "a": [1.0 / 3.0]})
    assert list(rounded.keys()) == ["a", "b"]
    assert rounded["b"] == 0.123456789012
    assert rounded["a"][0] == 0.333333333333

    print("PASS 30 unique preregistered seeds and exact batch slicing")
    print("PASS exact two-sided sign-test reference cases")
    print("PASS deterministic 12-decimal scientific rounding")
    print("Summary: 3 / 3 PASS")


if __name__ == "__main__":
    main()
