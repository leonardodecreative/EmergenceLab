#!/usr/bin/env python3
"""Run one exact ten-seed EL-EXP-GAMMA-003 v1.7 batch."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


EXPERIMENT_DIRECTORY = Path(__file__).resolve().parents[1]
CORE_PATH = EXPERIMENT_DIRECTORY / "src" / "EL-EXP-GAMMA-003-core.js"
RESULTS_DIRECTORY = EXPERIMENT_DIRECTORY / "results"
EXPECTED_BUILD_ID = "EL-EXP-GAMMA-003-v1.7.0-candidate"
ROUND_DECIMAL_PLACES = 12
CONFIRMATORY_SEEDS = [
    2218981198, 1929771240, 521111220, 474297633, 4029016462,
    1625019350, 1874816109, 3120607361, 578642397, 227299706,
    1391291206, 3053689021, 2331380888, 2126422385, 334384799,
    3810492981, 3259331138, 3650900357, 819091887, 4282557554,
    1815008022, 2006204464, 461026791, 4259554234, 2244171520,
    633117649, 3286174494, 327216863, 1656501849, 1624271877,
]


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, choices=[1, 2, 3], required=True)
    parser.add_argument("--role", choices=["B", "C"], required=True)
    return parser.parse_args()


def sha256_file(file_path: Path) -> str:
    digest = hashlib.sha256()
    with file_path.open("rb") as input_file:
        while True:
            block = input_file.read(1024 * 1024)
            if not block:
                break
            digest.update(block)
    return digest.hexdigest()


def round_floats(value: Any) -> Any:
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("Non-finite value in scientific payload")
        return round(value, ROUND_DECIMAL_PLACES)
    if isinstance(value, list):
        return [round_floats(item) for item in value]
    if isinstance(value, dict):
        return {key: round_floats(value[key]) for key in sorted(value)}
    return value


def main() -> None:
    arguments = parse_arguments()
    start = (arguments.batch - 1) * 10
    seeds = CONFIRMATORY_SEEDS[start:start + 10]
    javascript = r"""
const Gamma = require(process.argv[1]);
const seeds = JSON.parse(process.argv[2]);
const seedResults = seeds.map((seed) => Gamma.runSeed(seed, Gamma.DEFAULT_CONFIG));
process.stdout.write(JSON.stringify({
  buildId: Gamma.BUILD_ID,
  protocolId: Gamma.PROTOCOL_ID,
  config: Gamma.DEFAULT_CONFIG,
  seeds,
  confirmatorySeeds: Gamma.CONFIRMATORY_SEEDS,
  seedResults
}));
"""
    completed = subprocess.run(
        ["node", "-e", javascript, str(CORE_PATH), json.dumps(seeds)],
        cwd=EXPERIMENT_DIRECTORY,
        check=True,
        capture_output=True,
        text=True,
    )
    raw = json.loads(completed.stdout)
    if raw["buildId"] != EXPECTED_BUILD_ID:
        raise RuntimeError("Wrong build")
    if raw["confirmatorySeeds"] != CONFIRMATORY_SEEDS or raw["seeds"] != seeds:
        raise RuntimeError("Seed boundary mismatch")
    role_label = "Bobby B" if arguments.role == "B" else "Codex C"
    scientific = {
        "schema": "EL-EXP-GAMMA-003-batch-v1",
        "executionRole": role_label,
        "replicationOrder": "Bobby B first; Codex C second",
        "batch": arguments.batch,
        "buildId": raw["buildId"],
        "protocolId": raw["protocolId"],
        "config": raw["config"],
        "coreSha256": sha256_file(CORE_PATH),
        "seeds": seeds,
        "seedResults": raw["seedResults"],
        "roundingDecimalPlaces": ROUND_DECIMAL_PLACES,
    }
    role_neutral = {key: value for key, value in scientific.items() if key not in {"executionRole", "replicationOrder"}}
    canonical = json.dumps(round_floats(role_neutral), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    result = {
        **scientific,
        "roundedScientificSha256": hashlib.sha256(canonical.encode("utf-8")).hexdigest(),
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    }
    RESULTS_DIRECTORY.mkdir(parents=True, exist_ok=True)
    output = RESULTS_DIRECTORY / f"gamma_v1.7_{arguments.role}_batch{arguments.batch}.json"
    with output.open("w", encoding="utf-8") as output_file:
        json.dump(result, output_file, indent=2, sort_keys=True)
        output_file.write("\n")
    print(f"SUCCESS: {role_label} Batch {arguments.batch} saved to {output}")


if __name__ == "__main__":
    main()

