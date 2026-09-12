#!/usr/bin/env python3
"""Compare Bobby B and Codex C summaries after canonical rounding."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / "results"


def main() -> None:
    with (RESULTS / "gamma_v1.7_B_final_summary.json").open(encoding="utf-8") as input_file:
        bobby = json.load(input_file)
    with (RESULTS / "gamma_v1.7_C_final_summary.json").open(encoding="utf-8") as input_file:
        codex = json.load(input_file)
    match = bobby["roundedScientificSha256"] == codex["roundedScientificSha256"]
    result = {
        "schema": "EL-EXP-GAMMA-003-BC-comparison-v1",
        "bobbyScientificSha256": bobby["roundedScientificSha256"],
        "codexScientificSha256": codex["roundedScientificSha256"],
        "independentReplication": match,
        "selectedArmAgreement": bobby["selectedArm"] == codex["selectedArm"],
        "verdictAgreement": bobby["verdict"] == codex["verdict"],
        "finalVerdict": bobby["verdict"] if match else "VERSION_A_ADJUDICATION_REQUIRED",
    }
    with (RESULTS / "gamma_v1.7_BC_comparison.json").open("w", encoding="utf-8") as output_file:
        json.dump(result, output_file, indent=2, sort_keys=True)
        output_file.write("\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()

