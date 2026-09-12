#!/usr/bin/env python3
"""Aggregate v1.8 with event-stratified gates fixed before official execution."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import statistics
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / "results"
DECIMALS = 12
TOLERANCE = 1e-15
ALPHA = 0.05 / 4
MARGIN = 0.05
WORST_KIND_LIMIT = 0.10
MODELS = ["eventTypeStrength", "gammaLedger", "lambdaLens", "legacyDual", "tandemSelector"]
COMPARATORS = ["eventTypeStrength", "gammaLedger", "lambdaLens", "legacyDual"]
SEEDS = [
    1905123781, 3344673804, 3058392938, 2408944060, 2091590430,
    2850167134, 971057564, 3818395930, 2755931137, 4067859179,
    4060262032, 1685929515, 1522376007, 1945104714, 2078401519,
    683897624, 2020772043, 1757136121, 2414636604, 893699283,
    948183169, 634206583, 561559565, 2632838323, 3429266844,
    2286919808, 1837609131, 547644902, 4152929247, 2176902161,
]


def sign_test(values: list[float]) -> dict[str, Any]:
    positive = sum(value > TOLERANCE for value in values)
    negative = sum(value < -TOLERANCE for value in values)
    ties = len(values) - positive - negative
    n = positive + negative
    if not n:
        return {"positive": 0, "negative": 0, "tiesDiscarded": ties, "effectiveN": 0, "twoSidedPValue": 1.0, "direction": "none"}
    tail = sum(math.comb(n, k) / 2 ** n for k in range(min(positive, negative) + 1))
    direction = "positive" if positive > negative else "negative" if negative > positive else "balanced"
    return {"positive": positive, "negative": negative, "tiesDiscarded": ties, "effectiveN": n, "twoSidedPValue": min(1.0, 2 * tail), "direction": direction}


def summary(values: list[float]) -> dict[str, Any]:
    mean = statistics.fmean(values)
    sd = statistics.stdev(values)
    half = 2.045229642132703 * sd / math.sqrt(len(values))
    return {"n": len(values), "mean": mean, "median": statistics.median(values), "mean95PercentTInterval": [mean - half, mean + half], "exactTwoSidedSignTest": sign_test(values)}


def macro_rmse(seed: dict[str, Any], model: str) -> float:
    values = [metrics[model]["rmse"] ** 2 for metrics in seed["byEventKind"].values()]
    return math.sqrt(statistics.fmean(values))


def pooled_rmse(seeds: list[dict[str, Any]], model: str) -> float:
    numerator = sum(seed["modelMetrics"][model]["count"] * seed["modelMetrics"][model]["rmse"] ** 2 for seed in seeds)
    denominator = sum(seed["modelMetrics"][model]["count"] for seed in seeds)
    return math.sqrt(numerator / denominator)


def improvement(seed: dict[str, Any], comparator: str) -> float:
    baseline = macro_rmse(seed, comparator)
    candidate = macro_rmse(seed, "tandemSelector")
    return (baseline - candidate) / baseline if baseline else 0.0


def rounded(value: Any) -> Any:
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("non-finite scientific value")
        return round(value, DECIMALS)
    if isinstance(value, list):
        return [rounded(item) for item in value]
    if isinstance(value, dict):
        return {key: rounded(value[key]) for key in sorted(value)}
    return value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--role", choices=("B", "C"), required=True)
    args = parser.parse_args()
    batches = []
    for number in (1, 2, 3):
        path = RESULTS / f"gamma_v1.8_{args.role}_batch{number}.json"
        batch = json.loads(path.read_text())
        if batch["seeds"] != SEEDS[(number - 1) * 10:number * 10]:
            raise RuntimeError("batch seed mismatch")
        batches.append(batch)
    seeds = [item for batch in batches for item in batch["seedResults"]]
    if [item["seed"] for item in seeds] != SEEDS:
        raise RuntimeError("N=30 order mismatch")

    pooled = {model: pooled_rmse(seeds, model) for model in MODELS}
    macro = {model: statistics.fmean(macro_rmse(seed, model) for seed in seeds) for model in MODELS}
    comparisons = {name: summary([improvement(seed, name) for seed in seeds]) for name in COMPARATORS}
    pooled_macro_improvement = {name: (macro[name] - macro["tandemSelector"]) / macro[name] for name in COMPARATORS}

    event_kinds = list(seeds[0]["byEventKind"])
    per_kind = {}
    worst_degradation = -math.inf
    for kind in event_kinds:
        arm_rmse = {}
        for model in MODELS:
            squared = [seed["byEventKind"][kind][model]["rmse"] ** 2 for seed in seeds]
            arm_rmse[model] = math.sqrt(statistics.fmean(squared))
        best_single = min(arm_rmse[name] for name in ("gammaLedger", "lambdaLens"))
        degradation = (arm_rmse["tandemSelector"] - best_single) / best_single if best_single else 0.0
        worst_degradation = max(worst_degradation, degradation)
        per_kind[kind] = {"pooledRmse": arm_rmse, "tandemDegradationVsBestSingle": degradation}

    directional = {
        name: values["exactTwoSidedSignTest"]["direction"] == "positive"
        and values["exactTwoSidedSignTest"]["twoSidedPValue"] < ALPHA
        for name, values in comparisons.items()
    }
    gates = {
        "eventStratifiedOrdinaryMagnitude": pooled_macro_improvement["eventTypeStrength"] >= MARGIN,
        "eventStratifiedBestSingleMagnitude": min(pooled_macro_improvement["gammaLedger"], pooled_macro_improvement["lambdaLens"]) >= MARGIN,
        "eventStratifiedLegacyBlendMagnitude": pooled_macro_improvement["legacyDual"] >= MARGIN,
        "worstKindDegradationBound": worst_degradation <= WORST_KIND_LIMIT,
        "allFourBonferroniSignTests": all(directional.values()),
        "independentReplication": None,
    }
    substantive = all(value is True for key, value in gates.items() if key != "independentReplication")
    verdict = "PENDING_INDEPENDENT_REPLICATION_TANDEM_V1_8" if substantive else "DO_NOT_ADVANCE_TANDEM_V1_8"
    scientific = {
        "schema": "EL-EXP-GAMMA-004-N30-summary-v1",
        "buildId": batches[0]["buildId"],
        "protocolId": batches[0]["protocolId"],
        "coreSha256": batches[0]["coreSha256"],
        "seedCount": 30,
        "seeds": SEEDS,
        "batchScientificHashes": [batch["roundedScientificSha256"] for batch in batches],
        "seedResults": seeds,
        "microPooledRmse": pooled,
        "meanSeedMacroEventStratifiedRmse": macro,
        "tandemMacroImprovements": pooled_macro_improvement,
        "seedLevelMacroImprovementStatistics": comparisons,
        "eventKindResults": per_kind,
        "worstKindDegradation": worst_degradation,
        "gates": gates,
        "verdict": verdict,
    }
    canonical = json.dumps(rounded(scientific), sort_keys=True, separators=(",", ":"))
    result = {
        **scientific,
        "executionRole": "Bobby B" if args.role == "B" else "Codex C",
        "roundingDecimalPlaces": DECIMALS,
        "roundedScientificSha256": hashlib.sha256(canonical.encode()).hexdigest(),
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    }
    output = RESULTS / f"gamma_v1.8_{args.role}_final_summary.json"
    output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n")
    print(json.dumps({"role": result["executionRole"], "gates": gates, "verdict": verdict, "roundedScientificSha256": result["roundedScientificSha256"], "output": str(output)}, indent=2))


if __name__ == "__main__":
    main()
