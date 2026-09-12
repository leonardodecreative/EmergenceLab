# EL-EXP-GAMMA-004 v1.8

Frozen candidate for a Γ Ledger / Λ Lens tandem experiment.

The central correction is architectural: v1.7 Dual was a convex blend, not two independently stateful processes. v1.8 keeps the ledger and lens predictions separate and uses an independently serialized Λ reliability state to route typed-consequence channels without averaging them.

The frozen field is complete: Bobby B and Codex C independently executed all 30 seeds and produced the same rounded scientific SHA-256:

```text
4b0d51b4f7774181bc805bc93d27b2059547412bbfcfe9c477b83d6c1dcd83bd
```

Final verdict: `DO_NOT_ADVANCE_TANDEM_V1_8`. See `results/VERSION-A-RULING.md`.

## Commissioning only

```bash
node tests/EL-EXP-GAMMA-004-tests.js
python3 tests/test_gamma_v1.8_statistics.py
node tests/EL-EXP-GAMMA-004-commissioning.js
```

## Official order

```bash
bash RUN-BOBBY-B.sh
bash RUN-CODEX-C.sh
```

Do not execute Codex C until Bobby B's result exists. After both runs, execute:

```bash
python3 runners/gamma_v1_8_compare_BC.py
```

Do not interpret commissioning output as evidence.
