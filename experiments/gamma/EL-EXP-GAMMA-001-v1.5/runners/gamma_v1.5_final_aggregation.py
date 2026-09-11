#!/usr/bin/env python3
"""Aggregate Gamma v1.5 Batches 1-3 and calculate the N=30 final statistics."""

from __future__ import annotations

import hashlib
import json
import math
import statistics
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


WORKSPACE_DIRECTORY = Path(__file__).resolve().parents[1]
BATCH_PATHS = [
    WORKSPACE_DIRECTORY / "results" / "gamma_v1.5_batch1.json",
    WORKSPACE_DIRECTORY / "results" / "gamma_v1.5_batch2.json",
    WORKSPACE_DIRECTORY / "results" / "gamma_v1.5_batch3.json",
]
OUTPUT_PATH = WORKSPACE_DIRECTORY / "results" / "gamma_v1.5_final_summary.json"
EXPECTED_SEEDS = list(range(1, 31))
EXPECTED_BUILD_ID = "EL-EXP-GAMMA-001-v1.5.0"
EXPECTED_CONFIG_HASH = "13094d04"
EXPECTED_CORE_SHA256 = "33d4c44561382c581625aa801347b5da7d7e1c901b2cb6cdff9694b1211ead85"
T_CRITICAL_95_DF_29 = 2.045229642132703
Z_CRITICAL_95 = 1.959963984540054
SIGN_TOLERANCE = 1.0e-15
ALPHA = 0.05
ROUND_DECIMAL_PLACES = 12


def load_batches() -> list[dict[str, Any]]:
    batches = []
    for batch_path in BATCH_PATHS:
        with batch_path.open(encoding="utf-8") as input_file:
            batches.append(json.load(input_file))
    return batches


def validate_batches(batches: list[dict[str, Any]]) -> None:
    if len(batches) != 3:
        raise RuntimeError("Exactly three batches are required")

    all_seeds: list[int] = []
    for expected_batch_number, batch in enumerate(batches, start=1):
        if batch["batch"] != expected_batch_number:
            raise RuntimeError(f"Unexpected batch number: {batch['batch']}")
        if batch["buildId"] != EXPECTED_BUILD_ID:
            raise RuntimeError(f"Build mismatch in Batch {expected_batch_number}")
        if batch["configHash"] != EXPECTED_CONFIG_HASH:
            raise RuntimeError(f"Configuration mismatch in Batch {expected_batch_number}")
        if batch["coreSha256"] != EXPECTED_CORE_SHA256:
            raise RuntimeError(f"Core hash mismatch in Batch {expected_batch_number}")
        batch_seeds = batch["seeds"]
        result_seeds = [result["seed"] for result in batch["seedResults"]]
        if batch_seeds != result_seeds:
            raise RuntimeError(f"Seed/result mismatch in Batch {expected_batch_number}")
        all_seeds.extend(batch_seeds)

    if all_seeds != EXPECTED_SEEDS:
        raise RuntimeError(f"Expected Seeds 1-30 exactly; received {all_seeds}")
    if len(set(all_seeds)) != 30:
        raise RuntimeError("Duplicate seeds detected")


def binomial_probability(trial_count: int, success_count: int) -> float:
    return math.comb(trial_count, success_count) / (2 ** trial_count)


def exact_two_sided_sign_test(values: list[float]) -> dict[str, Any]:
    positive_count = sum(value > SIGN_TOLERANCE for value in values)
    negative_count = sum(value < -SIGN_TOLERANCE for value in values)
    tie_count = len(values) - positive_count - negative_count
    effective_count = positive_count + negative_count

    if effective_count == 0:
        return {
            "positive": positive_count,
            "negative": negative_count,
            "tiesDiscarded": tie_count,
            "effectiveN": effective_count,
            "twoSidedPValue": 1.0,
            "rejectAtAlpha0.05": False,
            "direction": "none",
        }

    smaller_count = min(positive_count, negative_count)
    lower_tail_probability = sum(
        binomial_probability(effective_count, count)
        for count in range(0, smaller_count + 1)
    )
    two_sided_probability = min(1.0, 2.0 * lower_tail_probability)
    direction = (
        "positive" if positive_count > negative_count
        else "negative" if negative_count > positive_count
        else "balanced"
    )
    return {
        "positive": positive_count,
        "negative": negative_count,
        "tiesDiscarded": tie_count,
        "effectiveN": effective_count,
        "twoSidedPValue": two_sided_probability,
        "rejectAtAlpha0.05": two_sided_probability < ALPHA,
        "direction": direction,
    }


def wilson_interval(success_count: int, trial_count: int) -> list[float | None]:
    if trial_count == 0:
        return [None, None]
    proportion = success_count / trial_count
    z_squared = Z_CRITICAL_95 * Z_CRITICAL_95
    denominator = 1.0 + z_squared / trial_count
    center = (proportion + z_squared / (2.0 * trial_count)) / denominator
    half_width = (
        Z_CRITICAL_95
        * math.sqrt(
            proportion * (1.0 - proportion) / trial_count
            + z_squared / (4.0 * trial_count * trial_count)
        )
        / denominator
    )
    return [center - half_width, center + half_width]


def summarize_seed_values(values: list[float]) -> dict[str, Any]:
    sample_count = len(values)
    sample_mean = statistics.fmean(values)
    sample_standard_deviation = statistics.stdev(values)
    standard_error = sample_standard_deviation / math.sqrt(sample_count)
    half_width = T_CRITICAL_95_DF_29 * standard_error
    sign_test = exact_two_sided_sign_test(values)
    return {
        "n": sample_count,
        "mean": sample_mean,
        "median": statistics.median(values),
        "minimum": min(values),
        "maximum": max(values),
        "sampleStandardDeviation": sample_standard_deviation,
        "mean95PercentTInterval": [sample_mean - half_width, sample_mean + half_width],
        "positiveRate": (
            sign_test["positive"] / sign_test["effectiveN"]
            if sign_test["effectiveN"]
            else None
        ),
        "positiveRate95PercentWilsonInterval": wilson_interval(
            sign_test["positive"],
            sign_test["effectiveN"],
        ),
        "exactTwoSidedSignTest": sign_test,
    }


def aggregate_model_metrics(seed_results: list[dict[str, Any]]) -> dict[str, Any]:
    model_names = list(seed_results[0]["modelMetrics"].keys())
    pooled_metrics: dict[str, Any] = {}
    for model_name in model_names:
        metrics = [result["modelMetrics"][model_name] for result in seed_results]
        total_count = sum(metric["count"] for metric in metrics)
        pooled_mean_squared_error = sum(
            metric["count"] * metric["balancedRmse"] * metric["balancedRmse"]
            for metric in metrics
        ) / total_count
        pooled_metrics[model_name] = {
            "count": total_count,
            "balancedRmse": math.sqrt(pooled_mean_squared_error),
            "meanCosine": sum(
                metric["count"] * metric["meanCosine"] for metric in metrics
            ) / total_count,
            "meanSignAgreement": sum(
                metric["count"] * metric["meanSignAgreement"] for metric in metrics
            ) / total_count,
        }
    return pooled_metrics


def calculate_pooled_score(
    pooled_metrics: dict[str, Any],
    primary_margin: float,
    shuffled_margin: float,
) -> dict[str, Any]:
    baseline_names = ["zero", "recency", "typeMean", "pairTypeMean", "stateKernel"]
    best_baseline_name = min(
        baseline_names,
        key=lambda name: pooled_metrics[name]["balancedRmse"],
    )
    best_baseline_rmse = pooled_metrics[best_baseline_name]["balancedRmse"]
    gamma_rmse = pooled_metrics["gammaRelational"]["balancedRmse"]
    shuffled_rmse = pooled_metrics["shuffledGammaRelational"]["balancedRmse"]
    baseline_improvement = (best_baseline_rmse - gamma_rmse) / best_baseline_rmse
    shuffled_improvement = (shuffled_rmse - gamma_rmse) / shuffled_rmse
    return {
        "bestBaseline": best_baseline_name,
        "bestBaselineRmse": best_baseline_rmse,
        "gammaRmse": gamma_rmse,
        "shuffledGammaRmse": shuffled_rmse,
        "baselineImprovement": baseline_improvement,
        "shuffledImprovement": shuffled_improvement,
        "requiredBaselineImprovement": primary_margin,
        "requiredShuffledImprovement": shuffled_margin,
        "baselineMarginPassed": baseline_improvement >= primary_margin,
        "shuffledMarginPassed": shuffled_improvement >= shuffled_margin,
    }


def round_floats(value: Any) -> Any:
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("Non-finite value in scientific payload")
        return round(value, ROUND_DECIMAL_PLACES)
    if isinstance(value, list):
        return [round_floats(item) for item in value]
    if isinstance(value, dict):
        return {key: round_floats(value[key]) for key in sorted(value)}
    return value


def main() -> None:
    batches = load_batches()
    validate_batches(batches)
    seed_results = [
        seed_result
        for batch in batches
        for seed_result in batch["seedResults"]
    ]
    config = batches[0]["config"]
    baseline_improvements = [
        result["score"]["baselineImprovement"] for result in seed_results
    ]
    shuffled_improvements = [
        result["score"]["shuffledImprovement"] for result in seed_results
    ]
    baseline_statistics = summarize_seed_values(baseline_improvements)
    shuffled_statistics = summarize_seed_values(shuffled_improvements)
    pooled_metrics = aggregate_model_metrics(seed_results)
    pooled_score = calculate_pooled_score(
        pooled_metrics,
        config["primaryImprovementMargin"],
        config["shuffledImprovementMargin"],
    )

    primary_sign_test = baseline_statistics["exactTwoSidedSignTest"]
    if primary_sign_test["rejectAtAlpha0.05"]:
        null_decision = "REJECT_NULL"
        null_interpretation = (
            "Seedwise Gamma improvement is not balanced around zero; "
            f"the observed direction is {primary_sign_test['direction']}."
        )
    else:
        null_decision = "RETAIN_NULL"
        null_interpretation = (
            "The exact two-sided sign test does not establish a seedwise "
            "directional difference from zero at alpha = 0.05."
        )

    frozen_margin_pass = (
        pooled_score["baselineMarginPassed"]
        and pooled_score["shuffledMarginPassed"]
    )
    final_verdict = (
        "GAMMA_V1_5_MEETS_FROZEN_EFFECT_MARGINS"
        if frozen_margin_pass
        else "GAMMA_V1_5_DOES_NOT_MEET_FROZEN_EFFECT_MARGINS"
    )

    scientific_payload = {
        "schema": "EL-EXP-GAMMA-001-N30-final-v1",
        "buildId": EXPECTED_BUILD_ID,
        "configHash": EXPECTED_CONFIG_HASH,
        "coreSha256": EXPECTED_CORE_SHA256,
        "seeds": EXPECTED_SEEDS,
        "seedCount": 30,
        "seedResults": seed_results,
        "pooledMetrics": pooled_metrics,
        "pooledScore": pooled_score,
        "seedLevelStatistics": {
            "baselineImprovement": baseline_statistics,
            "shuffledImprovement": shuffled_statistics,
        },
        "hypothesisDecision": {
            "primaryNull": (
                "Across independent seeds, positive and negative Gamma improvement "
                "relative to the best ordinary control are equally probable."
            ),
            "alpha": ALPHA,
            "decision": null_decision,
            "interpretation": null_interpretation,
        },
        "finalVerdict": final_verdict,
        "interpretationBoundary": (
            "The result applies only to frozen Gamma v1.5 measurement, representation, "
            "retrieval, field, horizon, capacity, bandwidth, and tested Seeds 1-30."
        ),
        "knownPilotSeedOverlap": [5, 18],
    }

    rounded_payload = round_floats(scientific_payload)
    canonical_json = json.dumps(
        rounded_payload,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    )
    result = {
        **scientific_payload,
        "roundingDecimalPlaces": ROUND_DECIMAL_PLACES,
        "roundedScientificSha256": hashlib.sha256(
            canonical_json.encode("utf-8")
        ).hexdigest(),
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    }

    with OUTPUT_PATH.open("w", encoding="utf-8") as output_file:
        json.dump(result, output_file, indent=2, sort_keys=True)
        output_file.write("\n")

    print(json.dumps({
        "seedCount": 30,
        "primarySignTest": primary_sign_test,
        "baselineImprovementMean": baseline_statistics["mean"],
        "baselineImprovement95PercentCI": baseline_statistics["mean95PercentTInterval"],
        "shuffledImprovementMean": shuffled_statistics["mean"],
        "shuffledImprovement95PercentCI": shuffled_statistics["mean95PercentTInterval"],
        "pooledScore": pooled_score,
        "nullDecision": null_decision,
        "finalVerdict": final_verdict,
        "output": OUTPUT_PATH.name,
    }, indent=2))


if __name__ == "__main__":
    main()
