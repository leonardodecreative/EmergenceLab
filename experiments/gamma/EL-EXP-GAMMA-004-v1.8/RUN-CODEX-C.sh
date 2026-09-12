#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
cd "$root"
if [[ ! -f results/gamma_v1.8_B_final_summary.json ]]; then
  echo "STOP: Bobby B must complete and preserve results/gamma_v1.8_B_final_summary.json first." >&2
  exit 1
fi
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum -c MANIFEST.sha256
else
  shasum -a 256 -c MANIFEST.sha256
fi
node tests/EL-EXP-GAMMA-004-tests.js
python3 tests/test_gamma_v1.8_statistics.py
node tests/EL-EXP-GAMMA-004-commissioning.js
python3 runners/gamma_v1_8_batch.py --role C --batch 1
python3 runners/gamma_v1_8_batch.py --role C --batch 2
python3 runners/gamma_v1_8_batch.py --role C --batch 3
python3 runners/gamma_v1_8_aggregate.py --role C
python3 runners/gamma_v1_8_compare_BC.py
echo "CODEX C COMPLETE: results/gamma_v1.8_C_final_summary.json"
