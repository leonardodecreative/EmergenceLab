#!/usr/bin/env python3
"""Aggregate one role's v1.7 field and enforce the frozen arm-selection gates."""

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
ROUND_DECIMAL_PLACES = 12
SIGN_TOLERANCE = 1.0e-15
ALPHA_PER_ARM = 0.05 / 3.0
PRIMARY_MARGIN = 0.05
SHUFFLED_MARGIN = 0.10
CANDIDATE_ARMS = ["writeMeaning", "readMeaning", "dualMeaning"]
ALL_ARMS = ["consequenceOnly", *CANDIDATE_ARMS]
ORDINARY = ["zeroMeaning", "typeMeanMeaning", "pairTypeMeanMeaning"]
CONFIRMATORY_SEEDS = [
    2218981198, 1929771240, 521111220, 474297633, 4029016462,
    1625019350, 1874816109, 3120607361, 578642397, 227299706,
    1391291206, 3053689021, 2331380888, 2126422385, 334384799,
    3810492981, 3259331138, 3650900357, 819091887, 4282557554,
    1815008022, 2006204464, 461026791, 4259554234, 2244171520,
    633117649, 3286174494, 327216863, 1656501849, 1624271877,
]


def exact_two_sided_sign_test(values: list[float]) -> dict[str, Any]:
    positive = sum(value > SIGN_TOLERANCE for value in values)
    negative = sum(value < -SIGN_TOLERANCE for value in values)
    ties = len(values) - positive - negative
    effective = positive + negative
    if effective == 0:
        return {"positive": 0, "negative": 0, "tiesDiscarded": ties, "effectiveN": 0, "twoSidedPValue": 1.0, "direction": "none"}
    smaller = min(positive, negative)
    tail = sum(math.comb(effective, count) / (2 ** effective) for count in range(smaller + 1))
    direction = "positive" if positive > negative else "negative" if negative > positive else "balanced"
    return {"positive": positive, "negative": negative, "tiesDiscarded": ties, "effectiveN": effective, "twoSidedPValue": min(1.0, 2.0 * tail), "direction": direction}


def round_floats(value: Any) -> Any:
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("Non-finite value")
        return round(value, ROUND_DECIMAL_PLACES)
    if isinstance(value, list):
        return [round_floats(item) for item in value]
    if isinstance(value, dict):
        return {key: round_floats(value[key]) for key in sorted(value)}
    return value


def pooled_metrics(seed_results: list[dict[str, Any]]) -> dict[str, Any]:
    output: dict[str, Any] = {}
    for model in seed_results[0]["modelMetrics"]:
        rows = [seed["modelMetrics"][model] for seed in seed_results]
        count = sum(row["count"] for row in rows)
        mse = sum(row["count"] * row["rmse"] ** 2 for row in rows) / count
        output[model] = {
            "count": count,
            "rmse": math.sqrt(mse),
            "meanCosine": sum(row["count"] * row["meanCosine"] for row in rows) / count,
        }
    return output


def summarize(values: list[float]) -> dict[str, Any]:
    standard_deviation = statistics.stdev(values)
    half_width = 2.045229642132703 * standard_deviation / math.sqrt(len(values))
    average = statistics.fmean(values)
    return {
        "n": len(values),
        "mean": average,
        "median": statistics.median(values),
        "mean95PercentTInterval": [average - half_width, average + half_width],
        "exactTwoSidedSignTest": exact_two_sided_sign_test(values),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--role", choices=["B", "C"], required=True)
    arguments = parser.parse_args()
    batches = []
    for batch_number in [1, 2, 3]:
        path = RESULTS_DIRECTORY / f"gamma_v1.7_{arguments.role}_batch{batch_number}.json"
        with path.open(encoding="utf-8") as input_file:
            batch = json.load(input_file)
        expected = CONFIRMATORY_SEEDS[(batch_number - 1) * 10:batch_number * 10]
        if batch["batch"] != batch_number or batch["seeds"] != expected:
            raise RuntimeError("Batch or seed mismatch")
        batches.append(batch)
    seed_results = [seed for batch in batches for seed in batch["seedResults"]]
    if [seed["seed"] for seed in seed_results] != CONFIRMATORY_SEEDS:
        raise RuntimeError("N=30 order mismatch")
    pooled = pooled_metrics(seed_results)
    best_ordinary = min(ORDINARY, key=lambda name: pooled[name]["rmse"])
    arm_results: dict[str, Any] = {}
    for arm in CANDIDATE_ARMS:
        ordinary_values = []
        shuffled_values = []
        consequence_baseline_values = []
        for seed in seed_results:
            arm_rmse = seed["modelMetrics"][arm]["rmse"]
            ordinary_rmse = seed["modelMetrics"][best_ordinary]["rmse"]
            shuffled_rmse = seed["modelMetrics"][f"shuffled_{arm}"]["rmse"]
            consequence_baseline_rmse = seed["modelMetrics"]["consequenceOnly"]["rmse"]
            ordinary_values.append((ordinary_rmse - arm_rmse) / ordinary_rmse if ordinary_rmse else 0.0)
            shuffled_values.append((shuffled_rmse - arm_rmse) / shuffled_rmse if shuffled_rmse else 0.0)
            consequence_baseline_values.append((consequence_baseline_rmse - arm_rmse) / consequence_baseline_rmse if consequence_baseline_rmse else 0.0)
        ordinary_pooled = (pooled[best_ordinary]["rmse"] - pooled[arm]["rmse"]) / pooled[best_ordinary]["rmse"]
        shuffled_pooled = (pooled[f"shuffled_{arm}"]["rmse"] - pooled[arm]["rmse"]) / pooled[f"shuffled_{arm}"]["rmse"]
        ordinary_stats = summarize(ordinary_values)
        shuffled_stats = summarize(shuffled_values)
        consequence_baseline_stats = summarize(consequence_baseline_values)
        gates = {
            "ordinaryMagnitude": ordinary_pooled >= PRIMARY_MARGIN,
            "shuffledMagnitude": shuffled_pooled >= SHUFFLED_MARGIN,
            "consequenceBaselineDirection": consequence_baseline_stats["exactTwoSidedSignTest"]["direction"] == "positive" and consequence_baseline_stats["exactTwoSidedSignTest"]["twoSidedPValue"] < ALPHA_PER_ARM,
            "ordinaryDirection": ordinary_stats["exactTwoSidedSignTest"]["direction"] == "positive" and ordinary_stats["exactTwoSidedSignTest"]["twoSidedPValue"] < ALPHA_PER_ARM,
            "shuffledDirection": shuffled_stats["exactTwoSidedSignTest"]["direction"] == "positive" and shuffled_stats["exactTwoSidedSignTest"]["twoSidedPValue"] < ALPHA_PER_ARM,
            "independentReplication": None,
        }
        arm_results[arm] = {
            "rmse": pooled[arm]["rmse"],
            "shuffledRmse": pooled[f"shuffled_{arm}"]["rmse"],
            "ordinaryImprovement": ordinary_pooled,
            "shuffledImprovement": shuffled_pooled,
            "seedStatistics": {"ordinary": ordinary_stats, "shuffled": shuffled_stats, "consequenceOnly": consequence_baseline_stats},
            "gates": gates,
            "substantivePass": all(value is True for key, value in gates.items() if key != "independentReplication"),
        }
    eligible = [arm for arm in CANDIDATE_ARMS if arm_results[arm]["substantivePass"]]
    selected = min(eligible, key=lambda arm: arm_results[arm]["rmse"]) if eligible else None
    pairwise = {}
    for left_index, left in enumerate(ALL_ARMS):
        for right in ALL_ARMS[left_index + 1:]:
            values = [
                (seed["modelMetrics"][right]["rmse"] - seed["modelMetrics"][left]["rmse"]) / seed["modelMetrics"][right]["rmse"]
                for seed in seed_results
            ]
            pairwise[f"{left}_vs_{right}"] = summarize(values)
    interaction_values = []
    for seed in seed_results:
        metric = seed["modelMetrics"]
        interaction_values.append(
            metric["writeMeaning"]["rmse"] + metric["readMeaning"]["rmse"]
            - metric["dualMeaning"]["rmse"] - metric["consequenceOnly"]["rmse"]
        )
    verdict = f"PENDING_INDEPENDENT_REPLICATION_{selected}" if selected else "DO_NOT_ADVANCE_MEANING_FACTORIAL_V1_7"
    scientific = {
        "schema": "EL-EXP-GAMMA-003-N30-summary-v1",
        "buildId": batches[0]["buildId"],
        "protocolId": batches[0]["protocolId"],
        "coreSha256": batches[0]["coreSha256"],
        "seeds": CONFIRMATORY_SEEDS,
        "seedCount": 30,
        "batchScientificHashes": [batch["roundedScientificSha256"] for batch in batches],
        "seedResults": seed_results,
        "pooledMetrics": pooled,
        "bestOrdinary": best_ordinary,
        "armResults": arm_results,
        "pairwiseCandidateStatistics": pairwise,
        "dualInteractionContrast": summarize(interaction_values),
        "selectedArm": selected,
        "verdict": verdict,
    }
    canonical = json.dumps(round_floats(scientific), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    result = {
        **scientific,
        "executionRole": "Bobby B" if arguments.role == "B" else "Codex C",
        "roundingDecimalPlaces": ROUND_DECIMAL_PLACES,
        "roundedScientificSha256": hashlib.sha256(canonical.encode("utf-8")).hexdigest(),
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    }
    output = RESULTS_DIRECTORY / f"gamma_v1.7_{arguments.role}_final_summary.json"
    with output.open("w", encoding="utf-8") as output_file:
        json.dump(result, output_file, indent=2, sort_keys=True)
        output_file.write("\n")
    print(json.dumps({"role": result["executionRole"], "selectedArm": selected, "verdict": verdict, "roundedScientificSha256": result["roundedScientificSha256"], "output": str(output)}, indent=2))


if __name__ == "__main__":
    main()
