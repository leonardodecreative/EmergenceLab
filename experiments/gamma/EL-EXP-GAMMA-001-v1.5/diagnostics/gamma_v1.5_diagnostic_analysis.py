#!/usr/bin/env python3
"""Exploratory decomposition of the frozen EL-EXP-GAMMA-001 v1.5 N=30 run."""

from __future__ import annotations

import hashlib
import json
import math
import statistics
from collections import defaultdict
from pathlib import Path
from typing import Any, Callable


ROOT = Path(__file__).resolve().parents[1]
DIAGNOSTIC_DIRECTORY = ROOT / "diagnostics"
INPUTS = [DIAGNOSTIC_DIRECTORY / f"gamma_v1.5_diagnostic_events_batch{batch}.json" for batch in range(1, 4)]
FINAL_SUMMARY = ROOT / "results" / "gamma_v1.5_final_summary.json"
JSON_OUTPUT = DIAGNOSTIC_DIRECTORY / "gamma_v1.5_diagnostic_decomposition.json"
MARKDOWN_OUTPUT = DIAGNOSTIC_DIRECTORY / "gamma_v1.5_diagnostic_decomposition.md"
EXPECTED_CORE_SHA256 = "33d4c44561382c581625aa801347b5da7d7e1c901b2cb6cdff9694b1211ead85"
EXPECTED_CONFIG_HASH = "13094d04"
T_CRITICAL_95_DF_29 = 2.045229642132703
SIGN_TOLERANCE = 1.0e-15


def load_and_validate() -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    batches = [json.loads(path.read_text()) for path in INPUTS]
    summary = json.loads(FINAL_SUMMARY.read_text())
    all_seed_payloads: list[dict[str, Any]] = []
    for batch in batches:
        if batch["buildId"] != "EL-EXP-GAMMA-001-v1.5.0":
            raise RuntimeError("Build mismatch")
        if batch["coreSha256"] != EXPECTED_CORE_SHA256:
            raise RuntimeError("Core hash mismatch")
        if batch["configHash"] != EXPECTED_CONFIG_HASH:
            raise RuntimeError("Config hash mismatch")
        all_seed_payloads.extend(batch["seeds"])
    if [item["seed"] for item in all_seed_payloads] != list(range(1, 31)):
        raise RuntimeError("Expected Seeds 1-30 exactly")
    expected_digests = {item["seed"]: item["finalWorldDigest"] for item in summary["seedResults"]}
    for item in all_seed_payloads:
        if item["finalWorldDigest"] != expected_digests[item["seed"]]:
            raise RuntimeError(f"Digest mismatch for Seed {item['seed']}")
        if item["phaseCounts"] != {"acquisition": 360, "test": 180}:
            raise RuntimeError(f"Unexpected phase counts for Seed {item['seed']}: {item['phaseCounts']}")
        if len(item["events"]) != 180:
            raise RuntimeError(f"Unexpected test-event count for Seed {item['seed']}")
    return all_seed_payloads, batches[0], summary


def family_mse(prediction: list[float], actual: list[float], start: int, end: int) -> float:
    return sum((prediction[index] - actual[index]) ** 2 for index in range(start, end)) / (end - start)


def balanced_mse(prediction: list[float], actual: list[float], families: list[dict[str, Any]]) -> float:
    return statistics.fmean(family_mse(prediction, actual, family["start"], family["end"]) for family in families)


def exact_two_sided_sign_test(values: list[float]) -> dict[str, Any]:
    positive = sum(value > SIGN_TOLERANCE for value in values)
    negative = sum(value < -SIGN_TOLERANCE for value in values)
    ties = len(values) - positive - negative
    effective_n = positive + negative
    if effective_n == 0:
        probability = 1.0
        direction = "none"
    else:
        smaller = min(positive, negative)
        probability = min(1.0, 2.0 * sum(math.comb(effective_n, count) for count in range(smaller + 1)) / (2 ** effective_n))
        direction = "positive" if positive > negative else "negative" if negative > positive else "balanced"
    return {
        "positive": positive,
        "negative": negative,
        "ties": ties,
        "effectiveN": effective_n,
        "twoSidedP": probability,
        "direction": direction,
    }


def summarize_group(records: list[dict[str, Any]], model: str = "gammaRelational", control: str = "typeMean",
                    error_getter: Callable[[dict[str, Any], str], float] | None = None) -> dict[str, Any]:
    if error_getter is None:
        error_getter = lambda record, name: record["errors"][name]
    by_seed: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        by_seed[record["seed"]].append(record)
    seed_improvements = []
    for seed in sorted(by_seed):
        selected = by_seed[seed]
        model_rmse = math.sqrt(statistics.fmean(error_getter(record, model) for record in selected))
        control_rmse = math.sqrt(statistics.fmean(error_getter(record, control) for record in selected))
        seed_improvements.append((control_rmse - model_rmse) / control_rmse if control_rmse else 0.0)
    model_rmse = math.sqrt(statistics.fmean(error_getter(record, model) for record in records))
    control_rmse = math.sqrt(statistics.fmean(error_getter(record, control) for record in records))
    pooled_improvement = (control_rmse - model_rmse) / control_rmse if control_rmse else 0.0
    mean_value = statistics.fmean(seed_improvements)
    standard_deviation = statistics.stdev(seed_improvements) if len(seed_improvements) > 1 else 0.0
    half_width = T_CRITICAL_95_DF_29 * standard_deviation / math.sqrt(len(seed_improvements))
    return {
        "eventCount": len(records),
        "seedCount": len(seed_improvements),
        "modelRmse": model_rmse,
        "controlRmse": control_rmse,
        "pooledImprovement": pooled_improvement,
        "meanSeedImprovement": mean_value,
        "meanSeedImprovement95PercentTInterval": [mean_value - half_width, mean_value + half_width],
        "medianSeedImprovement": statistics.median(seed_improvements),
        "signTest": exact_two_sided_sign_test(seed_improvements),
    }


def benjamini_hochberg(items: dict[str, dict[str, Any]]) -> None:
    ranked = sorted(items.items(), key=lambda pair: pair[1]["signTest"]["twoSidedP"])
    count = len(ranked)
    running = 1.0
    for reverse_index in range(count - 1, -1, -1):
        name, result = ranked[reverse_index]
        rank = reverse_index + 1
        candidate = min(1.0, result["signTest"]["twoSidedP"] * count / rank)
        running = min(running, candidate)
        result["signTest"]["benjaminiHochbergQ"] = running


def quantiles(values: list[float]) -> tuple[float, float, float]:
    cuts = statistics.quantiles(values, n=4, method="inclusive")
    return cuts[0], cuts[1], cuts[2]


def quartile_label(value: float, cuts: tuple[float, float, float]) -> str:
    if value <= cuts[0]:
        return "Q1"
    if value <= cuts[1]:
        return "Q2"
    if value <= cuts[2]:
        return "Q3"
    return "Q4"


def percentage(value: float) -> str:
    return f"{100.0 * value:.2f}%"


def markdown_table(headers: list[str], rows: list[list[str]]) -> str:
    output = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    output.extend("| " + " | ".join(row) + " |" for row in rows)
    return "\n".join(output)


def main() -> None:
    seed_payloads, metadata, final_summary = load_and_validate()
    families = metadata["contextFamilies"]
    channels = metadata["contextChannels"]
    records: list[dict[str, Any]] = []
    for seed_payload in seed_payloads:
        for event in seed_payload["events"]:
            actual = event["consequence"]
            errors = {}
            family_errors = {}
            channel_errors = {}
            for model, prediction in event["predictions"].items():
                errors[model] = balanced_mse(prediction, actual, families)
                family_errors[model] = {
                    family["name"]: family_mse(prediction, actual, family["start"], family["end"])
                    for family in families
                }
                channel_errors[model] = {
                    channels[index]: (prediction[index] - actual[index]) ** 2
                    for index in range(len(channels))
                }
            records.append({
                "seed": seed_payload["seed"],
                "actorId": event["actorId"],
                "targetId": event["targetId"],
                "dyad": f"{event['actorId']}->{event['targetId']}",
                "kind": event["kind"],
                "strength": event["strength"],
                "signature": event["signature"],
                "errors": errors,
                "familyErrors": family_errors,
                "channelErrors": channel_errors,
            })

    overall = {
        "versusTypeMean": summarize_group(records),
        "versusShuffled": summarize_group(records, control="shuffledGammaRelational"),
        "relationalVersusDyadic": summarize_group(records, control="gammaDyadic"),
    }
    expected_pooled = final_summary["pooledScore"]
    if abs(overall["versusTypeMean"]["modelRmse"] - expected_pooled["gammaRmse"]) > 1e-12:
        raise RuntimeError("Event extraction did not reproduce pooled Gamma RMSE")
    if abs(overall["versusTypeMean"]["controlRmse"] - expected_pooled["bestBaselineRmse"]) > 1e-12:
        raise RuntimeError("Event extraction did not reproduce pooled typeMean RMSE")

    def grouped(field: str) -> dict[str, dict[str, Any]]:
        values: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for record in records:
            values[str(record[field])].append(record)
        output = {name: summarize_group(group_records) for name, group_records in sorted(values.items())}
        benjamini_hochberg(output)
        return output

    by_event_kind = grouped("kind")
    by_strength = grouped("strength")
    by_target = grouped("targetId")
    by_dyad = grouped("dyad")

    by_family = {}
    for family in families:
        family_name = family["name"]
        getter = lambda record, model, family_name=family_name: record["familyErrors"][model][family_name]
        by_family[family_name] = summarize_group(records, error_getter=getter)
    benjamini_hochberg(by_family)

    by_channel = {}
    for channel in channels:
        getter = lambda record, model, channel=channel: record["channelErrors"][model][channel]
        by_channel[channel] = summarize_group(records, error_getter=getter)
    benjamini_hochberg(by_channel)

    state_features = {
        "target.X": 0,
        "target.Y": 1,
        "target.ThetaCoherence": 16,
        "relation.resonance": 17,
        "environment": 22,
    }
    state_regimes: dict[str, Any] = {}
    for feature, index in state_features.items():
        cuts = quantiles([record["signature"][index] for record in records])
        quartile_results = {}
        for quartile in ("Q1", "Q2", "Q3", "Q4"):
            selected = [record for record in records if quartile_label(record["signature"][index], cuts) == quartile]
            if selected:
                quartile_results[quartile] = summarize_group(selected)
        benjamini_hochberg(quartile_results)
        state_regimes[feature] = {"cuts": cuts, "quartiles": quartile_results}

    negative_seeds = [
        result["seed"] for result in final_summary["seedResults"]
        if result["score"]["baselineImprovement"] < 0
    ]

    payload = {
        "schema": "EL-EXP-GAMMA-001-v1.5-diagnostic-decomposition-v1",
        "status": "EXPLORATORY_NONCAUSAL",
        "buildId": metadata["buildId"],
        "coreSha256": metadata["coreSha256"],
        "configHash": metadata["configHash"],
        "sourceSeedCount": 30,
        "testEventCount": len(records),
        "actualAcquisitionEventsPerSeed": 360,
        "configuredAcquisitionEvents": metadata["config"]["acquisitionEvents"],
        "scheduleObservation": "The frozen schedule executes the configured 360 acquisition events followed by 180 held-out test events per seed.",
        "validation": {
            "allFinalWorldDigestsMatched": True,
            "pooledGammaRmseMatched": True,
            "pooledTypeMeanRmseMatched": True,
        },
        "overall": overall,
        "byEventKind": by_event_kind,
        "byStrength": by_strength,
        "byConsequenceFamily": by_family,
        "byChannel": by_channel,
        "byTarget": by_target,
        "byDyad": by_dyad,
        "byStateRegime": state_regimes,
        "negativeSeeds": negative_seeds,
        "multiplicity": "Benjamini-Hochberg q-values are calculated separately within each diagnostic family. All subgroup results are exploratory.",
    }
    scientific = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    payload["scientificSha256"] = hashlib.sha256(scientific.encode("utf-8")).hexdigest()
    JSON_OUTPUT.write_text(json.dumps(payload, indent=2) + "\n")

    event_rows = []
    for name, result in sorted(by_event_kind.items(), key=lambda pair: pair[1]["pooledImprovement"], reverse=True):
        event_rows.append([name, percentage(result["pooledImprovement"]), percentage(result["meanSeedImprovement"]),
                           f"{result['signTest']['positive']}/{result['signTest']['effectiveN']}",
                           f"{result['signTest']['twoSidedP']:.4g}", f"{result['signTest']['benjaminiHochbergQ']:.4g}"])
    family_rows = []
    for name, result in sorted(by_family.items(), key=lambda pair: pair[1]["pooledImprovement"], reverse=True):
        family_rows.append([name, percentage(result["pooledImprovement"]), percentage(result["meanSeedImprovement"]),
                            f"{result['signTest']['positive']}/{result['signTest']['effectiveN']}",
                            f"{result['signTest']['twoSidedP']:.4g}", f"{result['signTest']['benjaminiHochbergQ']:.4g}"])
    channel_rank = sorted(by_channel.items(), key=lambda pair: pair[1]["pooledImprovement"], reverse=True)
    channel_rows = [[name, percentage(result["pooledImprovement"]), percentage(result["meanSeedImprovement"]),
                     f"{result['signTest']['positive']}/{result['signTest']['effectiveN']}",
                     f"{result['signTest']['benjaminiHochbergQ']:.4g}"] for name, result in channel_rank]
    dyad_rank = sorted(by_dyad.items(), key=lambda pair: pair[1]["pooledImprovement"], reverse=True)
    dyad_rows = [[name, percentage(result["pooledImprovement"]), percentage(result["meanSeedImprovement"]),
                  f"{result['signTest']['positive']}/{result['signTest']['effectiveN']}"]
                 for name, result in dyad_rank[:5] + dyad_rank[-5:]]

    lines = [
        "# EL-EXP-GAMMA-001 v1.5 - Frozen N=30 Diagnostic Decomposition",
        "",
        "**Status:** Exploratory and noncausal. This report does not modify the frozen v1.5 result or authorize Gamma integration.",
        "",
        "## Validation and audit note",
        "",
        "- All 30 final-world digests reproduce the sealed batch results.",
        "- Pooled Gamma and typeMean RMSE reproduce the sealed N=30 aggregation.",
        "- The frozen schedule executes the configured **360 acquisition events** followed by 180 held-out test events per seed.",
        "- All subgroup tests are exploratory. Benjamini-Hochberg q-values are calculated separately within each diagnostic family.",
        "",
        "## Overall reproduction",
        "",
        f"- Gamma vs typeMean pooled improvement: **{percentage(overall['versusTypeMean']['pooledImprovement'])}**.",
        f"- Gamma vs shuffled pooled improvement: **{percentage(overall['versusShuffled']['pooledImprovement'])}**.",
        f"- Relational Gamma vs dyadic Gamma pooled improvement: **{percentage(overall['relationalVersusDyadic']['pooledImprovement'])}**.",
        f"- Seeds favoring relational over dyadic Gamma: **{overall['relationalVersusDyadic']['signTest']['positive']} / 30**.",
        "",
        "## Event-class decomposition",
        "",
        markdown_table(["Event", "Pooled gain", "Mean seed gain", "Positive seeds", "p", "BH q"], event_rows),
        "",
        "## Consequence-family decomposition",
        "",
        markdown_table(["Family", "Pooled gain", "Mean seed gain", "Positive seeds", "p", "BH q"], family_rows),
        "",
        "## Channel decomposition",
        "",
        markdown_table(["Channel", "Pooled gain", "Mean seed gain", "Positive seeds", "BH q"], channel_rows),
        "",
        "## Highest and lowest dyadic gains",
        "",
        markdown_table(["Dyad", "Pooled gain", "Mean seed gain", "Positive seeds"], dyad_rows),
        "",
        f"## Seeds favoring typeMean overall\n\n{', '.join(str(seed) for seed in negative_seeds)}",
        "",
        "## Interpretation boundary",
        "",
        "These decompositions locate predictive gain inside the existing v1.5 output. They do not establish causal benefit, subjective meaning, or a canonical Gamma law. A v1.6 change must be nominated before fresh testing and may not be selected by repeatedly optimizing against these same 30 seeds.",
        "",
        f"Scientific SHA-256: `{payload['scientificSha256']}`",
    ]
    MARKDOWN_OUTPUT.write_text("\n".join(lines) + "\n")
    print(f"Wrote {JSON_OUTPUT}")
    print(f"Wrote {MARKDOWN_OUTPUT}")


if __name__ == "__main__":
    main()
