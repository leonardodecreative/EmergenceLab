#!/usr/bin/env python3
"""Run EL-EXP-GAMMA-001 v1.5 Seeds 1-10 only and save Batch 1 statistics."""

from __future__ import annotations

import hashlib
import json
import math
import statistics
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


WORKSPACE_DIRECTORY = Path(__file__).resolve().parents[1]
CORE_PATH = WORKSPACE_DIRECTORY / "src" / "EL-EXP-GAMMA-001-core.js"
EXPECTED_CORE_SHA256 = "33d4c44561382c581625aa801347b5da7d7e1c901b2cb6cdff9694b1211ead85"
OUTPUT_PATH = WORKSPACE_DIRECTORY / "results" / "gamma_v1.5_batch1.json"
BATCH_SEEDS = list(range(1, 11))
BATCH_NUMBER = 1
KNOWN_PILOT_SEED_OVERLAP = [5]
ROUND_DECIMAL_PLACES = 12
T_CRITICAL_95_DF_9 = 2.2621571628540993
Z_CRITICAL_95 = 1.959963984540054


def run_frozen_javascript_core() -> dict[str, Any]:
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
  seeds,
  seedResults: compactResults
}));
"""
    completed_process = subprocess.run(
        [
            "node",
            "-e",
            javascript_source,
            str(CORE_PATH),
            json.dumps(BATCH_SEEDS),
        ],
        cwd=WORKSPACE_DIRECTORY,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed_process.stdout)


def exact_sign_test(values: list[float], tolerance: float = 1.0e-15) -> dict[str, Any]:
    positive_count = sum(value > tolerance for value in values)
    negative_count = sum(value < -tolerance for value in values)
    tie_count = len(values) - positive_count - negative_count
    effective_count = positive_count + negative_count

    if effective_count == 0:
        return {
            "positive": positive_count,
            "negative": negative_count,
            "ties": tie_count,
            "effective_n": effective_count,
            "one_sided_p_greater": 1.0,
            "two_sided_p": 1.0,
        }

    denominator = 2 ** effective_count
    upper_tail = sum(
        math.comb(effective_count, count)
        for count in range(positive_count, effective_count + 1)
    ) / denominator
    lower_tail = sum(
        math.comb(effective_count, count)
        for count in range(0, positive_count + 1)
    ) / denominator
    two_sided_probability = min(1.0, 2.0 * min(lower_tail, upper_tail))

    return {
        "positive": positive_count,
        "negative": negative_count,
        "ties": tie_count,
        "effective_n": effective_count,
        "one_sided_p_greater": upper_tail,
        "two_sided_p": two_sided_probability,
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


def seed_level_summary(values: list[float]) -> dict[str, Any]:
    sample_count = len(values)
    sample_mean = statistics.fmean(values)
    sample_standard_deviation = statistics.stdev(values) if sample_count > 1 else 0.0
    standard_error = sample_standard_deviation / math.sqrt(sample_count) if sample_count else 0.0
    half_width = T_CRITICAL_95_DF_9 * standard_error
    sign_test = exact_sign_test(values)
    positive_rate_interval = wilson_interval(sign_test["positive"], sign_test["effective_n"])

    return {
        "n": sample_count,
        "mean": sample_mean,
        "median": statistics.median(values),
        "sample_standard_deviation": sample_standard_deviation,
        "mean_95_percent_t_interval": [sample_mean - half_width, sample_mean + half_width],
        "sign_test": sign_test,
        "positive_rate_95_percent_wilson_interval": positive_rate_interval,
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


def pooled_score(pooled_metrics: dict[str, Any]) -> dict[str, Any]:
    baseline_names = ["zero", "recency", "typeMean", "pairTypeMean", "stateKernel"]
    best_baseline_name = min(
        baseline_names,
        key=lambda name: pooled_metrics[name]["balancedRmse"],
    )
    best_baseline_rmse = pooled_metrics[best_baseline_name]["balancedRmse"]
    gamma_rmse = pooled_metrics["gammaRelational"]["balancedRmse"]
    shuffled_rmse = pooled_metrics["shuffledGammaRelational"]["balancedRmse"]
    baseline_improvement = (
        (best_baseline_rmse - gamma_rmse) / best_baseline_rmse
        if best_baseline_rmse > 0.0
        else 0.0
    )
    shuffled_improvement = (
        (shuffled_rmse - gamma_rmse) / shuffled_rmse
        if shuffled_rmse > 0.0
        else 0.0
    )
    return {
        "bestBaseline": best_baseline_name,
        "bestBaselineRmse": best_baseline_rmse,
        "gammaRmse": gamma_rmse,
        "baselineImprovement": baseline_improvement,
        "shuffledImprovement": shuffled_improvement,
    }


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


def sha256_file(file_path: Path) -> str:
    digest = hashlib.sha256()
    with file_path.open("rb") as file_handle:
        while True:
            block = file_handle.read(1024 * 1024)
            if not block:
                break
            digest.update(block)
    return digest.hexdigest()


def main() -> None:
    if not CORE_PATH.exists():
        raise FileNotFoundError(f"Frozen Gamma core not found: {CORE_PATH}")

    javascript_result = run_frozen_javascript_core()
    if javascript_result["buildId"] != "EL-EXP-GAMMA-001-v1.5.0":
        raise RuntimeError(
            f"Wrong frozen build: {javascript_result['buildId']}"
        )
    actual_core_sha256 = sha256_file(CORE_PATH)
    if actual_core_sha256 != EXPECTED_CORE_SHA256:
        raise RuntimeError(
            f"Frozen v1.5 core hash mismatch: {actual_core_sha256}"
        )
    if javascript_result["seeds"] != BATCH_SEEDS:
        raise RuntimeError("The JavaScript core returned an unexpected seed set")

    seed_results = javascript_result["seedResults"]
    ordinary_improvements = [
        result["score"]["baselineImprovement"] for result in seed_results
    ]
    shuffled_improvements = [
        result["score"]["shuffledImprovement"] for result in seed_results
    ]
    pooled_metrics = aggregate_model_metrics(seed_results)

    scientific_payload = {
        "schema": "EL-EXP-GAMMA-001-confirmatory-batch-v1",
        "executionRole": "Codex C",
        "replicationOrder": "Bobby B first; Codex C second",
        "batch": BATCH_NUMBER,
        "seedRange": [min(BATCH_SEEDS), max(BATCH_SEEDS)],
        "seeds": BATCH_SEEDS,
        "knownPilotSeedOverlap": KNOWN_PILOT_SEED_OVERLAP,
        "buildId": javascript_result["buildId"],
        "protocolId": javascript_result["protocolId"],
        "config": javascript_result["config"],
        "configHash": javascript_result["configHash"],
        "coreSha256": actual_core_sha256,
        "roundingDecimalPlaces": ROUND_DECIMAL_PLACES,
        "seedResults": seed_results,
        "pooledMetrics": pooled_metrics,
        "pooledScore": pooled_score(pooled_metrics),
        "seedLevelStatistics": {
            "baselineImprovement": seed_level_summary(ordinary_improvements),
            "shuffledImprovement": seed_level_summary(shuffled_improvements),
        },
        "scopeBoundary": (
            f"Batch {BATCH_NUMBER} only. Seeds outside "
            f"{min(BATCH_SEEDS)}-{max(BATCH_SEEDS)} were not executed by this script."
        ),
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
        "roundedScientificSha256": hashlib.sha256(
            canonical_json.encode("utf-8")
        ).hexdigest(),
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    }

    with OUTPUT_PATH.open("w", encoding="utf-8") as output_file:
        json.dump(result, output_file, indent=2, sort_keys=True)
        output_file.write("\n")

    print(
        f"SUCCESS: processed Seeds {min(BATCH_SEEDS)}-{max(BATCH_SEEDS)} only "
        f"and saved {OUTPUT_PATH.name}"
    )


if __name__ == "__main__":
    main()
