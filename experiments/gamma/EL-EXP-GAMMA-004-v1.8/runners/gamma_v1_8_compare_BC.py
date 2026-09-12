#!/usr/bin/env python3
"""Adjudicate Bobby B / Codex C agreement without rewriting either result."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / "results"


def main() -> None:
    bobby = json.loads((RESULTS / "gamma_v1.8_B_final_summary.json").read_text())
    codex = json.loads((RESULTS / "gamma_v1.8_C_final_summary.json").read_text())
    match = bobby["roundedScientificSha256"] == codex["roundedScientificSha256"]
    output = {
        "schema": "EL-EXP-GAMMA-004-BC-comparison-v1",
        "bobbyScientificSha256": bobby["roundedScientificSha256"],
        "codexScientificSha256": codex["roundedScientificSha256"],
        "independentReplication": match,
        "gateAgreement": bobby["gates"] == codex["gates"],
        "verdictAgreement": bobby["verdict"] == codex["verdict"],
        "finalVerdict": bobby["verdict"].replace("PENDING_INDEPENDENT_REPLICATION_", "ADVANCE_") if match else "VERSION_A_ADJUDICATION_REQUIRED",
    }
    (RESULTS / "gamma_v1.8_BC_comparison.json").write_text(json.dumps(output, indent=2, sort_keys=True) + "\n")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
