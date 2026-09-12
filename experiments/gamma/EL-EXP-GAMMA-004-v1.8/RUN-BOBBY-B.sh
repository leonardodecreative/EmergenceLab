#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
cd "$root"
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum -c MANIFEST.sha256
else
  shasum -a 256 -c MANIFEST.sha256
fi
node tests/EL-EXP-GAMMA-004-tests.js
python3 tests/test_gamma_v1.8_statistics.py
node tests/EL-EXP-GAMMA-004-commissioning.js
python3 runners/gamma_v1_8_batch.py --role B --batch 1
python3 runners/gamma_v1_8_batch.py --role B --batch 2
python3 runners/gamma_v1_8_batch.py --role B --batch 3
python3 runners/gamma_v1_8_aggregate.py --role B
echo "BOBBY B COMPLETE: results/gamma_v1.8_B_final_summary.json"
