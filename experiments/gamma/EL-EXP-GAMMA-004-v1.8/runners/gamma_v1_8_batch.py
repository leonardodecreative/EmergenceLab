#!/usr/bin/env python3
"""Run one exact ten-seed EL-EXP-GAMMA-004 v1.8 batch."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "src" / "EL-EXP-GAMMA-004-core.js"
RESULTS = ROOT / "results"
BUILD = "EL-EXP-GAMMA-004-v1.8.0-candidate"
DECIMALS = 12
SEEDS = [
    1905123781, 3344673804, 3058392938, 2408944060, 2091590430,
    2850167134, 971057564, 3818395930, 2755931137, 4067859179,
    4060262032, 1685929515, 1522376007, 1945104714, 2078401519,
    683897624, 2020772043, 1757136121, 2414636604, 893699283,
    948183169, 634206583, 561559565, 2632838323, 3429266844,
    2286919808, 1837609131, 547644902, 4152929247, 2176902161,
]


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


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, choices=(1, 2, 3), required=True)
    parser.add_argument("--role", choices=("B", "C"), required=True)
    args = parser.parse_args()
    first = (args.batch - 1) * 10
    seeds = SEEDS[first:first + 10]
    javascript = r"""
const Gamma = require(process.argv[1]);
const seeds = JSON.parse(process.argv[2]);
process.stdout.write(JSON.stringify({
  buildId: Gamma.BUILD_ID,
  protocolId: Gamma.PROTOCOL_ID,
  config: Gamma.DEFAULT_CONFIG,
  officialSeeds: Gamma.CANDIDATE_SEEDS,
  seedResults: seeds.map((seed) => Gamma.runSeed(seed, Gamma.DEFAULT_CONFIG))
}));
"""
    process = subprocess.run(
        ["node", "-e", javascript, str(CORE), json.dumps(seeds)],
        cwd=ROOT, check=True, capture_output=True, text=True,
    )
    raw = json.loads(process.stdout)
    if raw["buildId"] != BUILD or raw["officialSeeds"] != SEEDS:
        raise RuntimeError("build or frozen seed mismatch")
    role = "Bobby B" if args.role == "B" else "Codex C"
    scientific = {
        "schema": "EL-EXP-GAMMA-004-batch-v1",
        "batch": args.batch,
        "buildId": raw["buildId"],
        "protocolId": raw["protocolId"],
        "config": raw["config"],
        "coreSha256": sha256(CORE),
        "seeds": seeds,
        "seedResults": raw["seedResults"],
        "roundingDecimalPlaces": DECIMALS,
    }
    canonical = json.dumps(rounded(scientific), sort_keys=True, separators=(",", ":"))
    payload = {
        **scientific,
        "executionRole": role,
        "replicationOrder": "Bobby B first; Codex C second",
        "roundedScientificSha256": hashlib.sha256(canonical.encode()).hexdigest(),
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    }
    RESULTS.mkdir(exist_ok=True)
    output = RESULTS / f"gamma_v1.8_{args.role}_batch{args.batch}.json"
    output.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")
    print(f"SUCCESS: {role} Batch {args.batch} saved to {output}")


if __name__ == "__main__":
    main()
