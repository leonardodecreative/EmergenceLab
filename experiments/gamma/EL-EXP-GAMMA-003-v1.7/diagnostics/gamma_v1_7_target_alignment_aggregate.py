#!/usr/bin/env python3
"""Aggregate EL-EXP-GAMMA-003-DIAG-001 without changing confirmatory evidence."""

from __future__ import annotations

import json
import math
from pathlib import Path
from statistics import mean, stdev
from typing import Any


EXPERIMENT_DIRECTORY = Path(__file__).resolve().parents[1]
DIAGNOSTIC_DIRECTORY = EXPERIMENT_DIRECTORY / "diagnostics"
BATCH_PATHS = [
    DIAGNOSTIC_DIRECTORY / f"gamma_v1.7_diag_batch{batch}.json"
    for batch in (1, 2, 3)
]
OUTPUT_JSON = DIAGNOSTIC_DIRECTORY / "gamma_v1.7_target_alignment_diagnostic.json"
OUTPUT_MARKDOWN = DIAGNOSTIC_DIRECTORY / "gamma_v1.7_target_alignment_diagnostic.md"


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as input_file:
        return json.load(input_file)


def empty_moment(width: int) -> dict[str, Any]:
    return {"count": 0, "sum": [0.0] * width, "squaredNormSum": 0.0}


def merge_moment(target: dict[str, Any], source: dict[str, Any]) -> None:
    target["count"] += source["count"]
    target["squaredNormSum"] += source["squaredNormSum"]
    for index, value in enumerate(source["sum"]):
        target["sum"][index] += value


def centered_sum_squares(moment: dict[str, Any]) -> float:
    if moment["count"] == 0:
        return 0.0
    mean_norm_term = sum(value * value for value in moment["sum"]) / moment["count"]
    return max(0.0, moment["squaredNormSum"] - mean_norm_term)


def confidence_interval_95(values: list[float]) -> list[float]:
    if len(values) < 2:
        return [values[0], values[0]]
    half_width = 2.045229642132703 * stdev(values) / math.sqrt(len(values))
    center = mean(values)
    return [center - half_width, center + half_width]


def rmse(mse_sum: float, count: int) -> float:
    return math.sqrt(mse_sum / count) if count else 0.0


def exact_two_sided_sign_test(positive: int, negative: int) -> float:
    non_ties = positive + negative
    if non_ties == 0:
        return 1.0
    tail_count = min(positive, negative)
    lower_tail = sum(math.comb(non_ties, index) for index in range(tail_count + 1)) / (2 ** non_ties)
    return min(1.0, 2.0 * lower_tail)


def main() -> None:
    batches = [load_json(path) for path in BATCH_PATHS]
    seed_results = [seed for batch in batches for seed in batch["seedResults"]]
    seeds = [seed["seed"] for seed in seed_results]
    if seeds != [seed for batch in batches for seed in batch["seeds"]] or len(set(seeds)) != 30:
        raise RuntimeError("Expected exactly 30 unique seeds in frozen order")

    model_names = batches[0]["modelNames"]
    model_totals = {
        model: {"count": 0, "originalMseSum": 0.0, "alignedMseSum": 0.0, "typedMseSum": 0.0}
        for model in model_names
    }
    seed_alignment_improvements = {model: [] for model in model_names}
    seed_original_rmses = {model: [] for model in model_names}
    seed_aligned_rmses = {model: [] for model in model_names}

    overall_meaning = empty_moment(98)
    overall_typed = empty_moment(14)
    overall_frame = empty_moment(7)
    by_kind_meaning: dict[str, dict[str, Any]] = {}
    by_kind_typed: dict[str, dict[str, Any]] = {}
    by_kind_frame: dict[str, dict[str, Any]] = {}
    by_kind_models: dict[str, dict[str, dict[str, float]]] = {}

    for seed_result in seed_results:
        group = seed_result["overall"]
        merge_moment(overall_meaning, group["meaningMoment"])
        merge_moment(overall_typed, group["typedMoment"])
        merge_moment(overall_frame, group["frameMoment"])
        for model in model_names:
            source = group["models"][model]
            target = model_totals[model]
            for key in target:
                target[key] += source[key]
            original = rmse(source["originalMseSum"], source["count"])
            aligned = rmse(source["alignedMseSum"], source["count"])
            seed_original_rmses[model].append(original)
            seed_aligned_rmses[model].append(aligned)
            improvement = (original - aligned) / original if original else 0.0
            seed_alignment_improvements[model].append(improvement)

        for kind, kind_group in seed_result["byKind"].items():
            if kind not in by_kind_meaning:
                by_kind_meaning[kind] = empty_moment(98)
                by_kind_typed[kind] = empty_moment(14)
                by_kind_frame[kind] = empty_moment(7)
                by_kind_models[kind] = {
                    model: {"count": 0, "originalMseSum": 0.0, "alignedMseSum": 0.0, "typedMseSum": 0.0}
                    for model in model_names
                }
            merge_moment(by_kind_meaning[kind], kind_group["meaningMoment"])
            merge_moment(by_kind_typed[kind], kind_group["typedMoment"])
            merge_moment(by_kind_frame[kind], kind_group["frameMoment"])
            for model in model_names:
                for key in by_kind_models[kind][model]:
                    by_kind_models[kind][model][key] += kind_group["models"][model][key]

    def variance_explained(overall: dict[str, Any], groups: dict[str, dict[str, Any]]) -> float:
        total = centered_sum_squares(overall)
        within = sum(centered_sum_squares(group) for group in groups.values())
        return 1.0 - within / total if total else 0.0

    model_summary = {}
    for model, totals in model_totals.items():
        original = rmse(totals["originalMseSum"], totals["count"])
        aligned = rmse(totals["alignedMseSum"], totals["count"])
        typed = rmse(totals["typedMseSum"], totals["count"])
        improvements = seed_alignment_improvements[model]
        model_summary[model] = {
            "count": totals["count"],
            "originalMeaningRmse": original,
            "currentFrameAlignedMeaningRmse": aligned,
            "alignmentImprovement": (original - aligned) / original if original else 0.0,
            "meanSeedAlignmentImprovement": mean(improvements),
            "meanSeedAlignmentImprovement95Ci": confidence_interval_95(improvements),
            "typedConsequenceRmseAfterRecovery": typed,
            "originalSeedRmse95Ci": confidence_interval_95(seed_original_rmses[model]),
            "alignedSeedRmse95Ci": confidence_interval_95(seed_aligned_rmses[model]),
        }

    pairwise_aligned = {}
    pairwise_names = [
        ("dualMeaning", "readMeaning"),
        ("writeMeaning", "readMeaning"),
        ("dualMeaning", "writeMeaning"),
        ("readMeaning", "typeMeanMeaning"),
        ("writeMeaning", "typeMeanMeaning"),
        ("dualMeaning", "typeMeanMeaning"),
    ]
    for candidate, comparator in pairwise_names:
        improvements = [
            (comparator_rmse - candidate_rmse) / comparator_rmse if comparator_rmse else 0.0
            for candidate_rmse, comparator_rmse in zip(
                seed_aligned_rmses[candidate],
                seed_aligned_rmses[comparator],
            )
        ]
        positive = sum(value > 1e-15 for value in improvements)
        negative = sum(value < -1e-15 for value in improvements)
        ties = len(improvements) - positive - negative
        pairwise_aligned[f"{candidate}_vs_{comparator}"] = {
            "positiveSeeds": positive,
            "negativeSeeds": negative,
            "ties": ties,
            "exactTwoSidedSignP": exact_two_sided_sign_test(positive, negative),
            "meanSeedImprovement": mean(improvements),
            "meanSeedImprovement95Ci": confidence_interval_95(improvements),
        }

    kind_summary = {}
    for kind, models in by_kind_models.items():
        kind_summary[kind] = {
            model: {
                "count": values["count"],
                "originalMeaningRmse": rmse(values["originalMseSum"], values["count"]),
                "currentFrameAlignedMeaningRmse": rmse(values["alignedMseSum"], values["count"]),
                "typedConsequenceRmseAfterRecovery": rmse(values["typedMseSum"], values["count"]),
            }
            for model, values in models.items()
        }

    output = {
        "schema": "EL-EXP-GAMMA-003-DIAG-001-final-v1",
        "status": "exploratory-post-confirmatory",
        "seedCount": 30,
        "eventCount": overall_meaning["count"],
        "methodBoundary": (
            "This diagnostic re-executes the frozen field and uses no new outcome information in prediction. "
            "Least-squares rebinding supplies every model the already-observable current context frame."
        ),
        "eventTypeVarianceExplained": {
            "meaningTarget": variance_explained(overall_meaning, by_kind_meaning),
            "typedConsequence": variance_explained(overall_typed, by_kind_typed),
            "currentContextFrame": variance_explained(overall_frame, by_kind_frame),
        },
        "models": model_summary,
        "currentFrameAlignedPairwise": pairwise_aligned,
        "byEventKind": kind_summary,
    }

    with OUTPUT_JSON.open("w", encoding="utf-8") as output_file:
        json.dump(output, output_file, indent=2, sort_keys=True)
        output_file.write("\n")

    lines = [
        "# EL-EXP-GAMMA-003-DIAG-001 — Target-Alignment Diagnostic",
        "",
        "**Status:** Exploratory, post-confirmatory. It does not alter the frozen v1.7 verdict.",
        "",
        "## Question",
        "",
        "How much of the read arm's advantage comes from sharing the current context frame used to construct the target, and how much target variation is explained by event type?",
        "",
        "## Event-type variance decomposition",
        "",
        f"- Meaning target: {output['eventTypeVarianceExplained']['meaningTarget']:.4%}",
        f"- Typed consequence: {output['eventTypeVarianceExplained']['typedConsequence']:.4%}",
        f"- Current context frame: {output['eventTypeVarianceExplained']['currentContextFrame']:.4%}",
        "",
        "## Current-frame rebinding",
        "",
        "| Model | Original RMSE | Aligned RMSE | Change | Typed consequence RMSE |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for model in model_names:
        result = model_summary[model]
        lines.append(
            f"| {model} | {result['originalMeaningRmse']:.9f} | "
            f"{result['currentFrameAlignedMeaningRmse']:.9f} | "
            f"{result['alignmentImprovement']:.3%} | "
            f"{result['typedConsequenceRmseAfterRecovery']:.9f} |"
        )
    lines.extend([
        "",
        "## Paired seed comparisons after current-frame rebinding",
        "",
        "| Candidate vs comparator | Positive / negative / tie | Mean improvement | Exact sign p |",
        "| --- | ---: | ---: | ---: |",
    ])
    for comparison, result in pairwise_aligned.items():
        lines.append(
            f"| {comparison} | {result['positiveSeeds']} / {result['negativeSeeds']} / {result['ties']} | "
            f"{result['meanSeedImprovement']:.4%} | {result['exactTwoSidedSignP']:.6g} |"
        )
    lines.extend([
        "",
        "## Interpretation",
        "",
        "- Event kind explains approximately 82% of both the typed-consequence variance and the constructed meaning-target variance. The ordinary event-type baseline is therefore strong because the field's causal outputs are largely event-type determined.",
        "- Current-frame rebinding leaves read meaning unchanged by construction, while reducing write error by about 1.48% and dual error by about 1.16%.",
        "- After equalizing the context frame, dual and write narrowly outrank read in pooled RMSE, but neither paired seed comparison is significant. Dual and write split the seeds 15-15.",
        "- The diagnostic therefore does not locate meaning uniquely at write or read. It shows that context binding carries useful structure, while the original read-arm dominance was substantially affected by target-frame alignment.",
        "- All context-bound candidates still improve on current-frame-aligned event-type mean by only about 2.5-2.6%, below the frozen v1.7 practical margin.",
        "",
        "## Next diagnostic question",
        "",
        "Before proposing v1.8, increase causal heterogeneity without changing Gamma: identify which event families, actor-target relations, and pre-event state regions produce consequences that cannot be predicted adequately from event kind alone. A later confirmatory field should be justified by that decomposition, not tuned to make Gamma win.",
        "",
        "## Boundary",
        "",
        "Rebinding is a diagnostic matched-context control, not a new Gamma candidate. It uses the current context available at prediction time but never uses the held-out actual consequence.",
        "",
    ])
    OUTPUT_MARKDOWN.write_text("\n".join(lines), encoding="utf-8")
    print(f"SUCCESS: {OUTPUT_JSON}")
    print(f"SUCCESS: {OUTPUT_MARKDOWN}")


if __name__ == "__main__":
    main()
