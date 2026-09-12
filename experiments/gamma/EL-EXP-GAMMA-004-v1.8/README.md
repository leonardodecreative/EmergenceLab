# EL-EXP-GAMMA-004 v1.8

Frozen candidate for a Γ Ledger / Λ Lens tandem experiment.

The central correction is architectural: v1.7 Dual was a convex blend, not two independently stateful processes. v1.8 keeps the ledger and lens predictions separate and uses an independently serialized Λ reliability state to route typed-consequence channels without averaging them.

No official seed has been executed. Read `PREREGISTRATION.md` before running Bobby B.

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
