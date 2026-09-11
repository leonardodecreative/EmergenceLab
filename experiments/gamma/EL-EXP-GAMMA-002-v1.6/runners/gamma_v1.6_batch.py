#!/usr/bin/env python3
"""Run exactly one preregistered ten-seed Gamma v1.6 confirmatory batch."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import statistics
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


EXPERIMENT_DIRECTORY = Path(__file__).resolve().parents[1]
CORE_PATH = EXPERIMENT_DIRECTORY / "src" / "EL-EXP-GAMMA-002-core.js"
RESULTS_DIRECTORY = EXPERIMENT_DIRECTORY / "results"
EXPECTED_BUILD_ID = "EL-EXP-GAMMA-002-v1.6.0-candidate"
ROUND_DECIMAL_PLACES = 12
T_CRITICAL_95_DF_9 = 2.2621571628540993
Z_CRITICAL_95 = 1.959963984540054
SIGN_TOLERANCE = 1.0e-15

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
    parser.add_argument("--batch", type=int, choices=[1, 2, 3], required=True)
    parser.add_argument("--role", choices=["B", "C"], required=True)
    return parser.parse_args()


def seeds_for_batch(batch_number: int) -> list[int]:
    start_index = (batch_number - 1) * 10
    end_index = start_index + 10
    return CONFIRMATORY_SEEDS[start_index:end_index]


def sha256_file(file_path: Path) -> str:
    digest = hashlib.sha256()
    with file_path.open("rb") as input_file:
        while True:
            block = input_file.read(1024 * 1024)
            if not block:
                break
            digest.update(block)
    return digest.hexdigest()


def run_javascript_core(seeds: list[int]) -> dict[str, Any]:
    javascript_source = r"""
const Gamma = require(process.argv[1]);
const seeds = JSON.parse(process.argv[2]);
const config = JSON.parse(JSON.stringify(Gamma.DEFAULT_CONFIG));
const seedResults = seeds.map((seed) => Gamma.runSeed(seed, config));
const compactResults = seedResults.map((result) => ({
  seed: result.seed,
  modelMetrics: result.modelMetrics,
  score: result.score,
  meanConsequenceMagnitude: result.meanConsequenceMagnitude,
  archiveSizes: result.archiveSizes,
  finalWorldDigest: result.finalWorldDigest
}));
process.stdout.write(JSON.stringify({
  buildId: Gamma.BUILD_ID,
  protocolId: Gamma.PROTOCOL_ID,
  config,
  configHash: Gamma.fnv1a(Gamma.stableStringify(config)),
  confirmatorySeeds: Gamma.CONFIRMATORY_SEEDS,
  seeds,
  seedResults: compactResults
}));
"""
    completed_process = subprocess.run(
        ["node", "-e", javascript_source, str(CORE_PATH), json.dumps(seeds)],
        cwd=EXPERIMENT_DIRECTORY,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed_process.stdout)


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
            "direction": "none",
        }
    smaller_count = min(positive_count, negative_count)
    lower_tail = sum(
        math.comb(effective_count, count) / (2 ** effective_count)
        for count in range(smaller_count + 1)
    )
    direction = "positive" if positive_count > negative_count else "negative" if negative_count > positive_count else "balanced"
    return {
        "positive": positive_count,
        "negative": negative_count,
        "tiesDiscarded": tie_count,
        "effectiveN": effective_count,
        "twoSidedPValue": min(1.0, 2.0 * lower_tail),
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
    half_width = T_CRITICAL_95_DF_9 * sample_standard_deviation / math.sqrt(sample_count)
    sign_test = exact_two_sided_sign_test(values)
    return {
        "n": sample_count,
        "mean": sample_mean,
        "median": statistics.median(values),
        "sampleStandardDeviation": sample_standard_deviation,
        "mean95PercentTInterval": [sample_mean - half_width, sample_mean + half_width],
        "exactTwoSidedSignTest": sign_test,
        "positiveRate95PercentWilsonInterval": wilson_interval(
            sign_test["positive"],
            sign_test["effectiveN"],
        ),
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
            raise ValueError("Non-finite floating-point value cannot be hashed")
        return round(value, ROUND_DECIMAL_PLACES)
    if isinstance(value, list):
        return [round_floats(item) for item in value]
    if isinstance(value, dict):
        return {key: round_floats(value[key]) for key in sorted(value)}
    return value


def main() -> None:
    arguments = parse_arguments()
    batch_seeds = seeds_for_batch(arguments.batch)
    javascript_result = run_javascript_core(batch_seeds)
    if javascript_result["buildId"] != EXPECTED_BUILD_ID:
        raise RuntimeError(f"Wrong build: {javascript_result['buildId']}")
    if javascript_result["confirmatorySeeds"] != CONFIRMATORY_SEEDS:
        raise RuntimeError("Core confirmatory seeds do not match the preregistration")
    if javascript_result["seeds"] != batch_seeds:
        raise RuntimeError("Core returned an unexpected seed set")

    seed_results = javascript_result["seedResults"]
    comparisons = {
        "ordinary": [result["score"]["baselineImprovement"] for result in seed_results],
        "shuffledCircular": [result["score"]["shuffledImprovement"] for result in seed_results],
        "linearV15": [result["score"]["linearImprovement"] for result in seed_results],
    }
    scientific_payload = {
        "schema": "EL-EXP-GAMMA-002-confirmatory-batch-v1",
        "executionRole": f"{'Bobby' if arguments.role == 'B' else 'Codex'} {arguments.role}",
        "replicationOrder": "Bobby B first; Codex C second",
        "batch": arguments.batch,
        "seeds": batch_seeds,
        "buildId": javascript_result["buildId"],
        "protocolId": javascript_result["protocolId"],
        "config": javascript_result["config"],
        "configHash": javascript_result["configHash"],
        "coreSha256": sha256_file(CORE_PATH),
        "roundingDecimalPlaces": ROUND_DECIMAL_PLACES,
        "seedResults": seed_results,
        "pooledMetrics": aggregate_model_metrics(seed_results),
        "seedLevelStatistics": {
            name: summarize_seed_values(values)
            for name, values in comparisons.items()
        },
        "scopeBoundary": f"Batch {arguments.batch} only; no seed outside this preregistered ten-seed slice was executed.",
    }
    replication_payload = {
        key: value
        for key, value in scientific_payload.items()
        if key not in {"executionRole", "replicationOrder"}
    }
    replication_canonical_json = json.dumps(
        round_floats(replication_payload),
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    )
    artifact_canonical_json = json.dumps(
        round_floats(scientific_payload),
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    )
    result = {
        **scientific_payload,
        "roundedScientificSha256": hashlib.sha256(replication_canonical_json.encode("utf-8")).hexdigest(),
        "artifactPayloadSha256": hashlib.sha256(artifact_canonical_json.encode("utf-8")).hexdigest(),
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    }
    RESULTS_DIRECTORY.mkdir(parents=True, exist_ok=True)
    output_path = RESULTS_DIRECTORY / f"gamma_v1.6_{arguments.role}_batch{arguments.batch}.json"
    with output_path.open("w", encoding="utf-8") as output_file:
        json.dump(result, output_file, indent=2, sort_keys=True)
        output_file.write("\n")
    print(f"SUCCESS: {arguments.role} Batch {arguments.batch} saved to {output_path}")


if __name__ == "__main__":
    main()
