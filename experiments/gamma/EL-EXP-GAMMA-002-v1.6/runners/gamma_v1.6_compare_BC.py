#!/usr/bin/env python3
"""Compare completed Bobby B and Codex C Gamma v1.6 summaries."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


EXPERIMENT_DIRECTORY = Path(__file__).resolve().parents[1]
RESULTS_DIRECTORY = EXPERIMENT_DIRECTORY / "results"
B_PATH = RESULTS_DIRECTORY / "gamma_v1.6_B_final_summary.json"
C_PATH = RESULTS_DIRECTORY / "gamma_v1.6_C_final_summary.json"
OUTPUT_PATH = RESULTS_DIRECTORY / "gamma_v1.6_BC_comparison.json"


def load_json(file_path: Path) -> dict[str, Any]:
    with file_path.open(encoding="utf-8") as input_file:
        return json.load(input_file)


def main() -> None:
    b_result = load_json(B_PATH)
    c_result = load_json(C_PATH)
    matching_hash = b_result["roundedScientificSha256"] == c_result["roundedScientificSha256"]
    matching_verdict = b_result["verdict"] == c_result["verdict"]
    first_four_pass = all(
        b_result["gates"][name] is True
        for name in ["ordinaryMagnitude", "permutationMagnitude", "repairSpecificDirection", "primaryDirection"]
    )
    independent_replication = matching_hash and matching_verdict
    all_five_pass = first_four_pass and independent_replication
    if all_five_pass:
        verdict = "ADVANCE_TO_SEPARATE_PREREGISTERED_CAUSAL_GAMMA_EXPERIMENT"
    else:
        verdict = "DO_NOT_ADVANCE_CIRCULAR_PHASE_GAMMA_V1_6"
    result = {
        "schema": "EL-EXP-GAMMA-002-BC-comparison-v1",
        "bScientificSha256": b_result["roundedScientificSha256"],
        "cScientificSha256": c_result["roundedScientificSha256"],
        "matchingScientificHash": matching_hash,
        "matchingSingleRunVerdict": matching_verdict,
        "gates": {
            **b_result["gates"],
            "independentReplication": independent_replication,
        },
        "allFiveGatesPassed": all_five_pass,
        "verdict": verdict,
        "boundary": "Advancement authorizes drafting a separate causal experiment; it does not modify the canonical engine.",
    }
    with OUTPUT_PATH.open("w", encoding="utf-8") as output_file:
        json.dump(result, output_file, indent=2, sort_keys=True)
        output_file.write("\n")
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
