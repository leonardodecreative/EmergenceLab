# Three completed exploratory Children-of-Men information assays

**Status:** completed 2026-10-17; no artificial life or RSMA learning demonstrated.

Read [RESULTS_REPORT.md](RESULTS_REPORT.md) for all three outcomes, controls, and scope limits. This is a **separate exploratory BCS-1 track**, not the canonical RSMA model and not the unfrozen EL-CR-ALIFE-001 reproduction confirmation.

## Reproducibility
The full evidence archive (including 6,336 paired state-difference diagnostics and per-example held-out decoder outcomes) was generated in the original research session and provided as `EL_COM_THREE_COMPLETED_EXPERIMENTS.zip`. It includes uncompressed executed Python source, original preregistration, raw CSVs, hashes, logs, and results. For convenience, the executed runner is also stored here as `run_three_experiments.py.gz.base64` (gzip-compressed, base64 ASCII); recover it with `base64 -d run_three_experiments.py.gz.base64 | gzip -d > run_three_experiments.py`. Original runner SHA-256: `ec3eec7b237b05f2f252b6e398794686488c2abf73a698b324e88e02d65379a6`.

**Important:** Runner requires `bcs_core.py` (unmodified law from ALife Engineering Increment 06) and Python with NumPy and scikit-learn. This branch is not yet a complete standalone clone-and-run source release; the full portable archive is supplied separately. The pre-execution sealed protocol SHA-256 was `d96b78cc63c7d1cb9622f16d7a405770d0cf736907251c41ba94cb6e2e2f18a9`. Results were recreated byte-for-byte in a second run. Unpublished canonical RSMA mechanisms were not transferred into this public branch.

Data summary:
- INFO-001 memory readout, BCS-1 t24: 48.4% decoder accuracy (not met).
- INFO-002 remote communication readout, BCS-1 t24: 49.5% accuracy (not met).
- INFO-003 post-damage remote recovery readout, BCS-1 t24: 47.9% accuracy (not met).
Causal effects are distinguishable from usable decoding.
