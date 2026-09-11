# EL-EXP-GAMMA-001 v1.5

Frozen historical experiment testing whether a bounded relational archive of measured downstream consequences retains predictive information beyond the implemented node state and simpler history controls.

## Status

- **Build:** `EL-EXP-GAMMA-001-v1.5.0`
- **Core SHA-256:** `33d4c44561382c581625aa801347b5da7d7e1c901b2cb6cdff9694b1211ead85`
- **Configuration hash:** `13094d04`
- **N=30 scientific result SHA-256:** `c8ebcc011a057fd0f00d0a89379cac4843fb61fe1c1f98d480826ee7a3182c16`
- **Decision:** Statistical signal detected; frozen practical margins not met; do not advance this realization into the canonical node.
- **Architecture boundary:** Noncausal predictive instrument. This package is not the canonical Emergence Lab engine and does not alter `X`, `Y`, `Z1`, `Z2`, or `Theta`.

## Confirmed N=30 result

| Comparison | Seed signs | Exact two-sided p | Mean seed improvement | Pooled improvement | Frozen margin |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gamma vs best ordinary control (`typeMean`) | 22 positive / 8 negative | 0.0161248 | 2.34% | 2.37% | 5.00% - failed |
| Gamma vs shuffled history | 29 positive / 1 negative | 5.7742e-08 | 8.60% | 8.65% | 10.00% - failed |

Seeds 5 and 18 overlap the earlier five-seed pilot. This is an expanded evaluation, not a wholly independent confirmation.

## Field

- 30 seeds, run as three batches of 10.
- 6 nodes.
- 30 warmup ticks.
- 360 acquisition events and 180 held-out test events per seed.
- 5,400 held-out predictions total.
- 23 signed consequence channels.
- Factual/counterfactual horizon `H = 10`.
- Archive capacity 48.
- Gaussian kernel bandwidth `sigma = 0.015`.
- Replication order: Bobby B first, Codex C second.
- Cross-runtime scientific hashing rounds floats to 12 decimal places.

## Run the original apparatus

From the `app` directory:

```bash
node EL-EXP-GAMMA-001-tests.js
node EL-EXP-GAMMA-001-browser-smoke.js
node EL-EXP-GAMMA-001-runner.js
python3 -m http.server 8000
```

Then open `http://localhost:8000/EL-EXP-GAMMA-001.html`.

## Reproduce the 30-seed aggregation

From the experiment directory:

```bash
python3 runners/gamma_v1.5_batch1.py
python3 runners/gamma_v1.5_batch2.py
python3 runners/gamma_v1.5_batch3.py
python3 runners/gamma_v1.5_final_aggregation.py
```

Each batch is intentionally separate to avoid long single-process runs and to preserve a clear failure boundary.

## Reproduce the exploratory decomposition

The decomposition is not part of the frozen advancement decision. It locates where predictive gain appears in the sealed v1.5 output.

```bash
node diagnostics/gamma_v1.5_diagnostic_extractor.js 1 10 diagnostics/gamma_v1.5_diagnostic_events_batch1.json
node diagnostics/gamma_v1.5_diagnostic_extractor.js 11 20 diagnostics/gamma_v1.5_diagnostic_events_batch2.json
node diagnostics/gamma_v1.5_diagnostic_extractor.js 21 30 diagnostics/gamma_v1.5_diagnostic_events_batch3.json
python3 diagnostics/gamma_v1.5_diagnostic_analysis.py
```

The large intermediate event files are reproducible and intentionally not committed. The committed decomposition JSON and Markdown report are derived from them.

## Exploratory finding

The diagnostic reproduced all 30 final-world digests and both primary pooled RMSE values. Its strongest observation was a retrieval-geometry asymmetry:

- Relational Gamma beat dyadic Gamma in 30 of 30 seeds, with 31.85% pooled improvement.
- Theta-family consequences showed 8.72% pooled improvement.
- `DISRUPT_PHASE` showed 8.08% pooled improvement.
- `ALIGN_THETA` showed -1.76% pooled improvement.

Because v1.5 measures normalized phase with linear Euclidean distance, the sole nominated v1.6 repair is circular phase distance. That repair is preregistered separately and has not yet been run.

## Contents

- `src/` - frozen v1.5 scientific core.
- `app/` - original browser apparatus, runner, and tests.
- `protocol/` - original protocol and calibration record.
- `runners/` - batched N=30 execution and aggregation.
- `results/` - commissioning, three batch outputs, and final N=30 summary.
- `diagnostics/` - exploratory extractor, analyzer, and derived decomposition.
- `checksums/` - SHA-256 manifest for the committed package.

## Interpretation boundary

This package supports the existence of a small predictive signal from correctly indexed consequential history under the tested field. It does not establish subjective meaning, moral valuation, consciousness, a universal Gamma variable, or a causal Gamma role. A failure or success applies only to the tested measurement, representation, retrieval law, parameterization, and field.
