#!/usr/bin/env python3
"""Held-out-seed analysis of residual consequence heterogeneity in Gamma v1.7."""

from __future__ import annotations

import json
import math
from pathlib import Path
from statistics import mean, stdev
from typing import Any

import numpy as np


EXPERIMENT_DIRECTORY = Path(__file__).resolve().parents[1]
DIAGNOSTIC_DIRECTORY = EXPERIMENT_DIRECTORY / "diagnostics"
RESULTS_DIRECTORY = EXPERIMENT_DIRECTORY / "results"
OUTPUT_JSON = DIAGNOSTIC_DIRECTORY / "gamma_v1.7_residual_heterogeneity.json"
OUTPUT_MARKDOWN = DIAGNOSTIC_DIRECTORY / "gamma_v1.7_residual_heterogeneity.md"
RIDGE_ALPHA = 1e-6
T_CRITICAL_29 = 2.045229642132703


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def confidence_interval(values: list[float]) -> list[float]:
    center = mean(values)
    half_width = T_CRITICAL_29 * stdev(values) / math.sqrt(len(values))
    return [center - half_width, center + half_width]


def exact_sign_test(positive: int, negative: int) -> float:
    count = positive + negative
    if count == 0:
        return 1.0
    tail = min(positive, negative)
    probability = sum(math.comb(count, index) for index in range(tail + 1)) / (2 ** count)
    return min(1.0, 2.0 * probability)


def feature_vector(record: dict[str, Any], specification: str, node_count: int, kind_count: int) -> list[float]:
    kind = [1.0 if index == record["kindIndex"] else 0.0 for index in range(kind_count)]
    pair_index = record["actorId"] * node_count + record["targetId"]
    pair = [1.0 if index == pair_index else 0.0 for index in range(node_count * node_count)]
    frame = record["currentFrame"]
    strength = [record["strength"]]
    type_context = [kind_value * frame_value for kind_value in kind for frame_value in frame]
    intercept = [1.0]
    if specification == "eventType":
        return intercept + kind
    if specification == "eventTypeStrength":
        return intercept + kind + strength
    if specification == "eventActorTarget":
        return intercept + kind + strength + pair
    if specification == "eventContext":
        return intercept + kind + strength + frame
    if specification == "fullInteraction":
        return intercept + kind + strength + pair + frame + type_context
    raise ValueError(specification)


def ridge_predict(train_x: np.ndarray, train_y: np.ndarray, test_x: np.ndarray) -> np.ndarray:
    gram = train_x.T @ train_x
    penalty = np.eye(gram.shape[0]) * RIDGE_ALPHA
    penalty[0, 0] = 0.0
    coefficients = np.linalg.solve(gram + penalty, train_x.T @ train_y)
    return test_x @ coefficients


def main() -> None:
    batches = [
        load_json(DIAGNOSTIC_DIRECTORY / f"gamma_v1.7_residual_batch{batch}.json")
        for batch in (1, 2, 3)
    ]
    official = load_json(RESULTS_DIRECTORY / "gamma_v1.7_B_final_summary.json")
    official_digests = {
        row["seed"]: row["roundedFinalWorldDigest"]
        for row in official["seedResults"]
    }
    seed_results = [result for batch in batches for result in batch["seedResults"]]
    if len(seed_results) != 30 or len({result["seed"] for result in seed_results}) != 30:
        raise RuntimeError("Expected 30 unique diagnostic seeds")
    for result in seed_results:
        if result["roundedFinalWorldDigest"] != official_digests[result["seed"]]:
            raise RuntimeError(f"World digest mismatch for seed {result['seed']}")

    records = [record for result in seed_results for record in result["records"]]
    if len(records) != 5400:
        raise RuntimeError(f"Expected 5400 held-out events, received {len(records)}")

    seeds = np.array([record["seed"] for record in records], dtype=np.uint64)
    targets = np.array([record["typedConsequence"] for record in records], dtype=float)
    node_count = 6
    event_kinds = batches[0]["eventKinds"]
    specifications = [
        "eventType",
        "eventTypeStrength",
        "eventActorTarget",
        "eventContext",
        "fullInteraction",
    ]
    prediction_by_model: dict[str, np.ndarray] = {}

    for specification in specifications:
        features = np.array([
            feature_vector(record, specification, node_count, len(event_kinds))
            for record in records
        ], dtype=float)
        predictions = np.zeros_like(targets)
        for held_out_seed in official["seeds"]:
            test_mask = seeds == held_out_seed
            train_mask = ~test_mask
            predictions[test_mask] = ridge_predict(
                features[train_mask],
                targets[train_mask],
                features[test_mask],
            )
        prediction_by_model[specification] = predictions

    errors_by_model = {
        specification: np.mean((prediction_by_model[specification] - targets) ** 2, axis=1)
        for specification in specifications
    }
    baseline_errors = errors_by_model["eventType"]
    strength_errors = errors_by_model["eventTypeStrength"]
    seed_rmse_by_model: dict[str, list[float]] = {specification: [] for specification in specifications}
    model_summary: dict[str, Any] = {}
    for specification in specifications:
        event_errors = errors_by_model[specification]
        pooled_rmse = math.sqrt(float(np.mean(event_errors)))
        seed_rmses = []
        seed_improvements = []
        for seed in official["seeds"]:
            mask = seeds == seed
            model_rmse = math.sqrt(float(np.mean(event_errors[mask])))
            baseline_rmse = math.sqrt(float(np.mean(baseline_errors[mask])))
            seed_rmses.append(model_rmse)
            seed_rmse_by_model[specification].append(model_rmse)
            seed_improvements.append((baseline_rmse - model_rmse) / baseline_rmse)
        positive = sum(value > 1e-15 for value in seed_improvements)
        negative = sum(value < -1e-15 for value in seed_improvements)
        model_summary[specification] = {
            "pooledTypedConsequenceRmse": pooled_rmse,
            "pooledImprovementVsEventType": (
                math.sqrt(float(np.mean(baseline_errors))) - pooled_rmse
            ) / math.sqrt(float(np.mean(baseline_errors))),
            "meanSeedImprovementVsEventType": mean(seed_improvements),
            "meanSeedImprovement95Ci": confidence_interval(seed_improvements),
            "positiveSeeds": positive,
            "negativeSeeds": negative,
            "ties": 30 - positive - negative,
            "exactTwoSidedSignP": exact_sign_test(positive, negative),
            "seedRmse95Ci": confidence_interval(seed_rmses),
        }

    incremental_vs_strength: dict[str, Any] = {}
    strength_pooled_rmse = math.sqrt(float(np.mean(strength_errors)))
    for specification in ["eventActorTarget", "eventContext", "fullInteraction"]:
        candidate_pooled_rmse = math.sqrt(float(np.mean(errors_by_model[specification])))
        improvements = [
            (strength_rmse - candidate_rmse) / strength_rmse
            for strength_rmse, candidate_rmse in zip(
                seed_rmse_by_model["eventTypeStrength"],
                seed_rmse_by_model[specification],
            )
        ]
        positive = sum(value > 1e-15 for value in improvements)
        negative = sum(value < -1e-15 for value in improvements)
        incremental_vs_strength[specification] = {
            "pooledImprovement": (strength_pooled_rmse - candidate_pooled_rmse) / strength_pooled_rmse,
            "meanSeedImprovement": mean(improvements),
            "meanSeedImprovement95Ci": confidence_interval(improvements),
            "positiveSeeds": positive,
            "negativeSeeds": negative,
            "ties": 30 - positive - negative,
            "exactTwoSidedSignP": exact_sign_test(positive, negative),
        }

    kind_summary: dict[str, Any] = {}
    for kind_index, kind_name in enumerate(event_kinds):
        mask = np.array([record["kindIndex"] == kind_index for record in records])
        baseline_rmse = math.sqrt(float(np.mean(baseline_errors[mask])))
        full_errors = np.mean((prediction_by_model["fullInteraction"] - targets) ** 2, axis=1)
        full_rmse = math.sqrt(float(np.mean(full_errors[mask])))
        kind_summary[kind_name] = {
            "count": int(np.sum(mask)),
            "eventTypeRmse": baseline_rmse,
            "fullInteractionRmse": full_rmse,
            "fullInteractionImprovement": (baseline_rmse - full_rmse) / baseline_rmse,
            "targetRmsMagnitude": math.sqrt(float(np.mean(targets[mask] ** 2))),
            "eventTypeSquaredErrorShare": float(np.sum(baseline_errors[mask]) / np.sum(baseline_errors)),
            "fullInteractionSquaredErrorShare": float(np.sum(full_errors[mask]) / np.sum(full_errors)),
        }

    residual_magnitude = np.sqrt(baseline_errors)
    support_fields = [
        "kernelMass",
        "effectiveKernelEntries",
        "nearestDistance",
        "sameKindCount",
        "sameDirectedPairKindCount",
    ]
    support_correlations = {}
    for field in support_fields:
        values = np.array([record["support"][field] for record in records], dtype=float)
        support_correlations[field] = float(np.corrcoef(values, residual_magnitude)[0, 1])

    output = {
        "schema": "EL-EXP-GAMMA-003-DIAG-002-final-v1",
        "status": "exploratory-post-confirmatory",
        "seedCount": 30,
        "heldOutEventCount": 5400,
        "crossValidation": "leave-one-seed-out ridge regression",
        "ridgeAlpha": RIDGE_ALPHA,
        "models": model_summary,
        "incrementalVsEventTypeStrength": incremental_vs_strength,
        "byEventKind": kind_summary,
        "eventTypeResidualCorrelations": support_correlations,
        "boundary": (
            "Linear held-out-seed decomposition only. Failure to gain from these features does not prove "
            "that nonlinear or longer-horizon context is irrelevant."
        ),
    }
    OUTPUT_JSON.write_text(json.dumps(output, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    lines = [
        "# EL-EXP-GAMMA-003-DIAG-002 — Residual Causal Heterogeneity",
        "",
        "**Status:** Exploratory, post-confirmatory. The frozen v1.7 verdict is unchanged.",
        "",
        "All predictions use leave-one-seed-out fitting: the evaluated seed never contributes to its model coefficients.",
        "",
        "## Held-out models",
        "",
        "| Model | Typed RMSE | Pooled improvement vs event type | Seeds + / − / tie | Sign p |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for specification in specifications:
        result = model_summary[specification]
        lines.append(
            f"| {specification} | {result['pooledTypedConsequenceRmse']:.9f} | "
            f"{result['pooledImprovementVsEventType']:.3%} | "
            f"{result['positiveSeeds']} / {result['negativeSeeds']} / {result['ties']} | "
            f"{result['exactTwoSidedSignP']:.6g} |"
        )
    lines.extend([
        "",
        "## Increment beyond event type plus strength",
        "",
        "| Candidate addition | Pooled improvement | Seeds + / − / tie | Mean seed 95% CI | Sign p |",
        "| --- | ---: | ---: | ---: | ---: |",
    ])
    for specification, result in incremental_vs_strength.items():
        interval = result["meanSeedImprovement95Ci"]
        lines.append(
            f"| {specification} | {result['pooledImprovement']:.3%} | "
            f"{result['positiveSeeds']} / {result['negativeSeeds']} / {result['ties']} | "
            f"[{interval[0]:.3%}, {interval[1]:.3%}] | {result['exactTwoSidedSignP']:.6g} |"
        )
    lines.extend([
        "",
        "## Full-interaction result by event kind",
        "",
        "| Event kind | Events | Event-type RMSE | Full RMSE | Improvement |",
        "| --- | ---: | ---: | ---: | ---: |",
    ])
    for kind_name, result in kind_summary.items():
        lines.append(
            f"| {kind_name} | {result['count']} | {result['eventTypeRmse']:.9f} | "
            f"{result['fullInteractionRmse']:.9f} | {result['fullInteractionImprovement']:.3%} |"
        )
    lines.extend([
        "",
        "## Boundary",
        "",
        output["boundary"],
        "",
    ])
    OUTPUT_MARKDOWN.write_text("\n".join(lines), encoding="utf-8")
    print(f"SUCCESS: {OUTPUT_JSON}")
    print(f"SUCCESS: {OUTPUT_MARKDOWN}")


if __name__ == "__main__":
    main()
