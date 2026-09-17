# Appendix — PR #4 Gamma v1.5/v1.6 archival delta

**Status:** Historical, noncausal evidence record.  
**Audit date:** 2026-09-17.  
**Source audited:** pull request #4 at commit `3316388e8d9439ca07fd58bf600848eea40c5c81`.  
**Authoritative later baseline:** merged v1.8 record at commit `18014a46dd86dda466374ab4ff8195ae5d644382`.

## Why this appendix exists

The merged v1.8 baseline describes the lineage through v1.8, but the paths named for the complete v1.5 and v1.6 packages were not present on `main` during this audit. Only a nested reference copy of the v1.6 core survived under the v1.7 package. PR #4 therefore was not purely superseded code: it contained unique calibration history, frozen parameter bounds, diagnostic telemetry, commissioning edge cases, and the v1.6 cross-runtime adjudication.

This appendix preserves the scientifically relevant delta before PR #4 is closed. The full raw apparatus, JSON results, tests, manifests, and runners remain addressable at the source commit above; they are not declared canonical engine code.

## EL-EXP-GAMMA-001 v1.5 — preserved design

The candidate was a bounded, inert archive

```math
\Gamma_i(t)=\{(s_k,c_k,\tau_k,H_k,q_k,a_k)\}_{k=1}^{K}
```

with event signature `s`, signed consequence `c`, settlement tick `τ`, horizon `H`, confidence `q`, actor identity `a`, and deterministic capacity `K`.

The measured consequence was

```math
c_t(H)=C(S^{e}_{t+H})-C(S^{\neg e}_{t+H})
```

from matched factual and event-suppressed branches cloned from the same pre-event world. Gamma never entered either branch and did not mutate `X`, `Y`, `Z1`, `Z2`, or `Theta`.

The 49-channel signature combined 17 target-state channels, 6 target relational/environment channels, 17 actor-state channels, 2 dyadic channels, and 7 event channels. The signed consequence vector had 23 channels. Retrieval used family-balanced RMS distance and a Gaussian kernel. The primary candidate predicted the contextual residual beyond the event-type mean, rather than predicting the full consequence from zero.

### Calibration defects repaired before freeze

1. A target-only signature collapsed A→B and C→B; actor state and dyadic relation were added.
2. Nearly fixed additive interventions let the event-type mean solve the first field; effects were made dependent on actor state, target state, dyadic alignment, saturation, and available recovery/integration capacity.
3. The first candidate predicted the full consequence from zero; the repaired candidate predicted residuals over an identical event-type baseline also supplied to the shuffled-history null.
4. A canonical-run guard marked altered parameters or substituted seeds `INVALID_RUN`.

The excluded calibration seed was `13579`. No official seed was inspected during calibration.

| Sigma | Capacity | Gamma RMSE | Best-control RMSE | Improvement | Versus shuffled |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0.015 | 48 | 0.00637153 | 0.00656710 | 2.98% | 6.71% |
| 0.020 | 48 | 0.00637755 | 0.00656710 | 2.89% | 7.29% |
| 0.030 | 48 | 0.00643420 | 0.00656710 | 2.02% | 2.84% |
| 0.020 | 96 | 0.00644758 | 0.00668743 | 3.59% | 7.17% |
| 0.015 | 96 | 0.00646738 | 0.00668743 | 3.29% | 6.69% |

Frozen selection: `sigma = 0.015`, capacity `48`, horizon `10`. The excluded seed failed both practical margins; the thresholds were not reduced.

### Frozen field and decision bounds

- 6 nodes; 30 warmup ticks.
- 360 acquisition and 180 held-out test events per seed.
- 30 official seeds (`1` through `30`); Seeds 5 and 18 overlapped the earlier pilot.
- Strengths `0.12`, `0.20`, and `0.28`; recency window `8`.
- Minimum mean consequence magnitude `0.0001`.
- Advancement required at least 5% pooled improvement over the best ordinary control and at least 10% over shuffled relational Gamma.
- Cross-runtime scientific payloads were rounded to 12 decimals.

### N=30 result

| Comparison | Pooled RMSE / improvement | Seed direction | Exact two-sided p | Frozen result |
| --- | ---: | ---: | ---: | --- |
| Relational Gamma vs `typeMean` | 0.006603576 vs 0.006764085; 2.372956% | 22 positive, 8 negative | 0.0161248 | Statistical direction passed; 5% practical margin failed |
| Relational Gamma vs shuffled history | 0.006603576 vs 0.007228927; 8.650676% | 29 positive, 1 negative | 5.7742e-08 | Statistical direction passed; 10% practical margin failed |

Verdict: `GAMMA_V1_5_DOES_NOT_MEET_FROZEN_EFFECT_MARGINS`.  
Scientific SHA-256: `c8ebcc011a057fd0f00d0a89379cac4843fb61fe1c1f98d480826ee7a3182c16`.

### Exploratory decomposition that nominated v1.6

The diagnostic reproduced all 30 final-world digests and the sealed pooled RMSE values.

- Relational Gamma beat dyadic Gamma in 30/30 seeds; pooled improvement 31.85%.
- Theta-family pooled gain was 8.72% (29/30 positive).
- `DISRUPT_PHASE` gained 8.08% (29/30 positive; BH q = 3.465e-07).
- `ALIGN_THETA` lost 1.76% (7/30 positive; BH q = 0.01567).
- Phase-channel pooled gains were 19.73%, 14.98%, and 6.76%.
- Frequency-channel pooled gains were about 58%, but seed means were heterogeneous; `Theta.frequency.2` had a 58.61% pooled gain while its mean seed gain was -12.01%.
- Seeds favoring `typeMean` overall were 1, 5, 6, 8, 13, 14, 16, and 29.
- Dyadic effects were heterogeneous: the recorded extremes ranged from +13.40% for 1→4 to -8.64% for 4→5.

These exploratory results nominated one repair only: circular distance for normalized phase. They did not authorize tuning on the same 30 seeds.

## EL-EXP-GAMMA-002 v1.6 — preserved formulation and bounds

For normalized phase coordinates `a,b ∈ [0,1]`:

```math
\delta_{circ}(a,b)=\min\left(|a-b|,1-|a-b|\right)
```

Non-phase coordinates retained `|a-b|`. Family distance and the Gaussian kernel remained:

```math
d_f(a,b)=\sqrt{\frac{1}{|f|}\sum_{j\in f}\delta_j(a_j,b_j)^2}
```

```math
d(a,b)=\frac{1}{F}\sum_{f=1}^{F}d_f(a,b)
```

```math
k(a,b)=\exp\left(-\frac{d(a,b)^2}{2\sigma^2}\right)
```

Circular treatment applied only to zero-based signature indices `10, 11, 12, 33, 34, 35`: target and actor `Theta.phase.0..2`. Frequency, amplitude, coherence, dyad, event, and consequence coordinates remained linear.

The field remained fixed at 6 nodes, 30 warmup ticks, 360 acquisition events, 180 tests, horizon 10, capacity 48, `sigma = 0.015`, `epsilon = 1e-9`, recency window 8, strengths 0.12/0.20/0.28, 23 consequence channels, and `alpha = 0.05`. Thirty fresh seeds were deterministically derived from `SHA256("EL-EXP-GAMMA-002-v1.6.0|confirmatory-seed|" + index)`; the ordered list remains in the source preregistration.

### Commissioning edge case

All 15 JavaScript tests, 3 statistical tests, and excluded-Seed-13579 commissioning passed. The natural commissioning field produced identical linear and circular aggregate predictions, so `naturalCircularPredictionChanged = false`. A deterministic wrap-boundary fixture proved the path was active:

| Fixture prediction | Linear | Circular |
| --- | ---: | ---: |
| Synthetic phase-wrap case | -0.1935283080 | 0.0675270684 |

The schedule, factual and counterfactual worlds, consequences, archive writes, frozen predictions, and final world were identical across candidates. Only the candidate retrieval path and derived metrics were permitted to differ.

### N=30 confirmatory result

| Comparison | Pooled improvement | Seed direction | Exact two-sided p | Gate |
| --- | ---: | ---: | ---: | --- |
| Circular Gamma vs best ordinary control (`typeMean`) | 0.877757% | 17 positive, 13 negative | 0.584664712 | Failed 5% magnitude and direction |
| Circular Gamma vs shuffled circular Gamma | 7.951755% | 30 positive, 0 negative | 1.8626451e-09 | Direction passed; 10% magnitude failed |
| Circular Gamma vs linear v1.5 Gamma | 0.00000917% | 7 positive, 4 negative, 19 ties | 0.548828125 | Failed repair-specific direction |

Pooled balanced RMSE values were 0.006456198874 for circular Gamma, 0.006456199466 for linear Gamma, 0.006513370444 for `typeMean`, and 0.007013929353 for shuffled circular Gamma.

Verdict: `DO_NOT_ADVANCE_CIRCULAR_PHASE_GAMMA_V1_6`. Circular geometry was cleaner, but empirically inert under this field, archive, bandwidth, horizon, and event schedule.

### Cross-runtime fingerprint failure and adjudication

Bobby B and Codex C initially produced different scientific hashes because `finalWorldDigest` hashed raw, unrounded JavaScript floating-point serialization.

- 58 numerical differences occurred before rounding.
- Maximum absolute difference: `1.1102230246251565e-15`.
- All differences disappeared at 12 decimals.
- Raw world digests differed for Seeds `1121900541`, `473552552`, and `1924554172`.
- Bobby B original SHA-256: `8d3b01c54ef102c824f45218093a2e0caf1f38b3f918211a05093259195d974b`.
- Codex C original SHA-256: `9cd8a1413510f62be17a111a63282cd6159663ee05d25e9b6c54b6b804b972c0`.
- Adjudicated role-neutral SHA-256: `9ed3471b9d203e4494cde80f5b41c0c7632e03c56bcb43383ff71e0159e2f037`.

Version A removed only the noncompliant raw world digests and derivative batch hashes, then applied the preregistered 12-decimal rule. The scientific payloads matched. The discrepancy was an instrumentation failure, not a replication failure.

Permanent correction: cross-runtime fingerprints must hash a canonical payload after 12-decimal rounding; raw runtime float serialization is not a scientific digest.

## Relationship to the v1.8 public record

This appendix does not supersede v1.8, reinstall v1.5/v1.6 code, alter the canonical simulator, or revive a failed candidate. It preserves the older evidence needed to understand why v1.7 and v1.8 were designed as they were.

The authoritative public state through v1.8 remains commit `18014a46dd86dda466374ab4ff8195ae5d644382`. Across v1.5–v1.8, correctly indexed consequential history showed repeatable predictive structure, but no tested realization cleared every frozen practical advancement margin.
