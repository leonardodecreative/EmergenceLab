#!/usr/bin/env python3
"""Aggregate one role's three Gamma v1.6 batches and enforce frozen gates 1-4."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import statistics
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


EXPERIMENT_DIRECTORY = Path(__file__).resolve().parents[1]
RESULTS_DIRECTORY = EXPERIMENT_DIRECTORY / "results"
EXPECTED_BUILD_ID = "EL-EXP-GAMMA-002-v1.6.0-candidate"
EXPECTED_PROTOCOL_ID = "circular-phase-retrieval-repair"
ROUND_DECIMAL_PLACES = 12
ALPHA = 0.05
PRIMARY_MARGIN = 0.05
SHUFFLED_MARGIN = 0.10
SIGN_TOLERANCE = 1.0e-15
T_CRITICAL_95_DF_29 = 2.045229642132703
Z_CRITICAL_95 = 1.959963984540054

CONFIRMATORY_SEEDS = [
    1620122227, 1121900541, 1167345866, 635455088, 152170300,
    1993643838, 2915565139, 4081553161, 2794246745, 2714469569,
    2033920072, 3841220894, 1220063660, 1227375349, 3632021282,
    2931948358, 3259612167, 3534294265, 473552552, 1667527166,
    3033302128, 1860056755, 718053086, 1106706679, 1924554172,
    1273162433, 3633298885, 2256554411, 2593750757, 391362109,
]


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--role", choices=["B", "C"], required=True)
    return parser.parse_args()


def load_batches(role: str) -> list[dict[str, Any]]:
    batches: list[dict[str, Any]] = []
    for batch_number in [1, 2, 3]:
        batch_path = RESULTS_DIRECTORY / f"gamma_v1.6_{role}_batch{batch_number}.json"
        with batch_path.open(encoding="utf-8") as input_file:
            batches.append(json.load(input_file))
    return batches


def validate_batches(batches: list[dict[str, Any]], role: str) -> None:
    expected_role = f"{'Bobby' if role == 'B' else 'Codex'} {role}"
    reference_config_hash = batches[0]["configHash"]
    reference_core_hash = batches[0]["coreSha256"]
    collected_seeds: list[int] = []
    for expected_batch_number, batch in enumerate(batches, start=1):
        if batch["schema"] != "EL-EXP-GAMMA-002-confirmatory-batch-v1":
            raise RuntimeError("Unexpected batch schema")
        if batch["batch"] != expected_batch_number:
            raise RuntimeError("Batch ordering mismatch")
        if batch["executionRole"] != expected_role:
            raise RuntimeError("Execution role mismatch")
        if batch["buildId"] != EXPECTED_BUILD_ID or batch["protocolId"] != EXPECTED_PROTOCOL_ID:
            raise RuntimeError("Build or protocol mismatch")
        if batch["configHash"] != reference_config_hash:
            raise RuntimeError("Configuration hash mismatch between batches")
        if batch["coreSha256"] != reference_core_hash:
            raise RuntimeError("Core SHA-256 mismatch between batches")
        expected_seeds = CONFIRMATORY_SEEDS[(expected_batch_number - 1) * 10:expected_batch_number * 10]
        if batch["seeds"] != expected_seeds:
            raise RuntimeError(f"Batch {expected_batch_number} seed slice mismatch")
        if [result["seed"] for result in batch["seedResults"]] != expected_seeds:
            raise RuntimeError(f"Batch {expected_batch_number} result ordering mismatch")
        collected_seeds.extend(batch["seeds"])
    if collected_seeds != CONFIRMATORY_SEEDS or len(set(collected_seeds)) != 30:
        raise RuntimeError("The aggregated field is not the exact preregistered N=30 set")


def exact_two_sided_sign_test(values: list[float]) -> dict[str, Any]:
    positive_count = sum(value > SIGN_TOLERANCE for value in values)
    negative_count = sum(value < -SIGN_TOLERANCE for value in values)
    tie_count = len(values) - positive_count - negative_count
    effective_count = positive_count + negative_count
    if effective_count == 0:
        return {
            "positive": 0,
            "negative": 0,
            "tiesDiscarded": tie_count,
            "effectiveN": 0,
            "twoSidedPValue": 1.0,
            "rejectAtAlpha0.05": False,
            "direction": "none",
        }
    smaller_count = min(positive_count, negative_count)
    lower_tail = sum(
        math.comb(effective_count, count) / (2 ** effective_count)
        for count in range(smaller_count + 1)
    )
    probability = min(1.0, 2.0 * lower_tail)
    direction = "positive" if positive_count > negative_count else "negative" if negative_count > positive_count else "balanced"
    return {
        "positive": positive_count,
        "negative": negative_count,
        "tiesDiscarded": tie_count,
        "effectiveN": effective_count,
        "twoSidedPValue": probability,
        "rejectAtAlpha0.05": probability < ALPHA,
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
    sample_mean = statistics.fmean(values)
    sample_standard_deviation = statistics.stdev(values)
    half_width = T_CRITICAL_95_DF_29 * sample_standard_deviation / math.sqrt(len(values))
    sign_test = exact_two_sided_sign_test(values)
    return {
        "n": len(values),
        "mean": sample_mean,
        "median": statistics.median(values),
        "minimum": min(values),
        "maximum": max(values),
        "sampleStandardDeviation": sample_standard_deviation,
        "mean95PercentTInterval": [sample_mean - half_width, sample_mean + half_width],
        "positiveRate": sign_test["positive"] / sign_test["effectiveN"] if sign_test["effectiveN"] else None,
        "positiveRate95PercentWilsonInterval": wilson_interval(sign_test["positive"], sign_test["effectiveN"]),
        "exactTwoSidedSignTest": sign_test,
    }


def aggregate_model_metrics(seed_results: list[dict[str, Any]]) -> dict[str, Any]:
    pooled_metrics: dict[str, Any] = {}
    for model_name in seed_results[0]["modelMetrics"]:
        metrics = [result["modelMetrics"][model_name] for result in seed_results]
        total_count = sum(metric["count"] for metric in metrics)
        pooled_mean_squared_error = sum(
            metric["count"] * metric["balancedRmse"] * metric["balancedRmse"]
            for metric in metrics
        ) / total_count
        pooled_metrics[model_name] = {
            "count": total_count,
            "balancedRmse": math.sqrt(pooled_mean_squared_error),
            "meanCosine": sum(metric["count"] * metric["meanCosine"] for metric in metrics) / total_count,
            "meanSignAgreement": sum(metric["count"] * metric["meanSignAgreement"] for metric in metrics) / total_count,
        }
    return pooled_metrics


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
    arguments = parse_arguments()
    batches = load_batches(arguments.role)
    validate_batches(batches, arguments.role)
    seed_results = [result for batch in batches for result in batch["seedResults"]]
    pooled_metrics = aggregate_model_metrics(seed_results)

    ordinary_values = [result["score"]["baselineImprovement"] for result in seed_results]
    shuffled_values = [result["score"]["shuffledImprovement"] for result in seed_results]
    linear_values = [result["score"]["linearImprovement"] for result in seed_results]
    ordinary_statistics = summarize_seed_values(ordinary_values)
    shuffled_statistics = summarize_seed_values(shuffled_values)
    linear_statistics = summarize_seed_values(linear_values)

    best_ordinary_name = min(
        ["zero", "recency", "typeMean", "pairTypeMean", "stateKernel"],
        key=lambda name: pooled_metrics[name]["balancedRmse"],
    )
    best_ordinary_rmse = pooled_metrics[best_ordinary_name]["balancedRmse"]
    circular_rmse = pooled_metrics["gammaRelationalCircular"]["balancedRmse"]
    shuffled_rmse = pooled_metrics["shuffledGammaRelationalCircular"]["balancedRmse"]
    linear_rmse = pooled_metrics["gammaRelational"]["balancedRmse"]
    ordinary_pooled_improvement = (best_ordinary_rmse - circular_rmse) / best_ordinary_rmse
    shuffled_pooled_improvement = (shuffled_rmse - circular_rmse) / shuffled_rmse
    linear_pooled_improvement = (linear_rmse - circular_rmse) / linear_rmse

    gates = {
        "ordinaryMagnitude": ordinary_pooled_improvement >= PRIMARY_MARGIN,
        "permutationMagnitude": shuffled_pooled_improvement >= SHUFFLED_MARGIN,
        "repairSpecificDirection": (
            linear_statistics["exactTwoSidedSignTest"]["rejectAtAlpha0.05"]
            and linear_statistics["exactTwoSidedSignTest"]["direction"] == "positive"
        ),
        "primaryDirection": (
            ordinary_statistics["exactTwoSidedSignTest"]["rejectAtAlpha0.05"]
            and ordinary_statistics["exactTwoSidedSignTest"]["direction"] == "positive"
        ),
        "independentReplication": None,
    }
    first_four_pass = all(value is True for key, value in gates.items() if key != "independentReplication")
    verdict = "PENDING_INDEPENDENT_REPLICATION" if first_four_pass else "DO_NOT_ADVANCE_CIRCULAR_PHASE_GAMMA_V1_6"

    role_label = f"{'Bobby' if arguments.role == 'B' else 'Codex'} {arguments.role}"
    scientific_payload = {
        "schema": "EL-EXP-GAMMA-002-N30-summary-v1",
        "buildId": EXPECTED_BUILD_ID,
        "protocolId": EXPECTED_PROTOCOL_ID,
        "configHash": batches[0]["configHash"],
        "coreSha256": batches[0]["coreSha256"],
        "seeds": CONFIRMATORY_SEEDS,
        "seedCount": 30,
        "batchScientificHashes": [batch["roundedScientificSha256"] for batch in batches],
        "seedResults": seed_results,
        "pooledMetrics": pooled_metrics,
        "pooledComparisons": {
            "bestOrdinary": best_ordinary_name,
            "bestOrdinaryRmse": best_ordinary_rmse,
            "linearGammaRmse": linear_rmse,
            "circularGammaRmse": circular_rmse,
            "shuffledCircularGammaRmse": shuffled_rmse,
            "ordinaryImprovement": ordinary_pooled_improvement,
            "shuffledImprovement": shuffled_pooled_improvement,
            "linearImprovement": linear_pooled_improvement,
        },
        "seedLevelStatistics": {
            "ordinary": ordinary_statistics,
            "shuffledCircular": shuffled_statistics,
            "linearV15": linear_statistics,
        },
        "gates": gates,
        "verdict": verdict,
    }
    canonical_json = json.dumps(round_floats(scientific_payload), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    result = {
        **scientific_payload,
        "executionRole": role_label,
        "roundingDecimalPlaces": ROUND_DECIMAL_PLACES,
        "roundedScientificSha256": hashlib.sha256(canonical_json.encode("utf-8")).hexdigest(),
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    }
    output_path = RESULTS_DIRECTORY / f"gamma_v1.6_{arguments.role}_final_summary.json"
    with output_path.open("w", encoding="utf-8") as output_file:
        json.dump(result, output_file, indent=2, sort_keys=True)
        output_file.write("\n")
    print(json.dumps({
        "role": role_label,
        "seedCount": 30,
        "gates": gates,
        "verdict": verdict,
        "roundedScientificSha256": result["roundedScientificSha256"],
        "output": str(output_path),
    }, indent=2))


if __name__ == "__main__":
    main()
