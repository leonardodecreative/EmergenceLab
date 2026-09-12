# EL-EXP-GAMMA-003-DIAG-001 — Target-Alignment Diagnostic

**Status:** Exploratory, post-confirmatory. It does not alter the frozen v1.7 verdict.

## Question

How much of the read arm's advantage comes from sharing the current context frame used to construct the target, and how much target variation is explained by event type?

## Event-type variance decomposition

- Meaning target: 81.5648%
- Typed consequence: 82.2757%
- Current context frame: 0.0812%

## Current-frame rebinding

| Model | Original RMSE | Aligned RMSE | Change | Typed consequence RMSE |
| --- | ---: | ---: | ---: | ---: |
| typeMeanMeaning | 0.004489145 | 0.004394390 | 2.111% | 0.006183621 |
| pairTypeMeanMeaning | 0.006356338 | 0.006247018 | 1.720% | 0.008792919 |
| consequenceOnly | 0.008392982 | 0.005141575 | 38.740% | 0.007239319 |
| writeMeaning | 0.004346315 | 0.004282132 | 1.477% | 0.006028806 |
| readMeaning | 0.004287234 | 0.004287234 | 0.000% | 0.006035619 |
| dualMeaning | 0.004332439 | 0.004282056 | 1.163% | 0.006028710 |

## Paired seed comparisons after current-frame rebinding

| Candidate vs comparator | Positive / negative / tie | Mean improvement | Exact sign p |
| --- | ---: | ---: | ---: |
| dualMeaning_vs_readMeaning | 17 / 13 / 0 | 0.1080% | 0.584665 |
| writeMeaning_vs_readMeaning | 17 / 13 / 0 | 0.1039% | 0.584665 |
| dualMeaning_vs_writeMeaning | 15 / 15 / 0 | 0.0036% | 1 |
| readMeaning_vs_typeMeanMeaning | 22 / 8 / 0 | 2.4924% | 0.0161248 |
| writeMeaning_vs_typeMeanMeaning | 23 / 7 / 0 | 2.6046% | 0.00522288 |
| dualMeaning_vs_typeMeanMeaning | 22 / 8 / 0 | 2.6070% | 0.0161248 |

## Interpretation

- Event kind explains approximately 82% of both the typed-consequence variance and the constructed meaning-target variance. The ordinary event-type baseline is therefore strong because the field's causal outputs are largely event-type determined.
- Current-frame rebinding leaves read meaning unchanged by construction, while reducing write error by about 1.48% and dual error by about 1.16%.
- After equalizing the context frame, dual and write narrowly outrank read in pooled RMSE, but neither paired seed comparison is significant. Dual and write split the seeds 15-15.
- The diagnostic therefore does not locate meaning uniquely at write or read. It shows that context binding carries useful structure, while the original read-arm dominance was substantially affected by target-frame alignment.
- All context-bound candidates still improve on current-frame-aligned event-type mean by only about 2.5-2.6%, below the frozen v1.7 practical margin.

## Next diagnostic question

Before proposing v1.8, increase causal heterogeneity without changing Gamma: identify which event families, actor-target relations, and pre-event state regions produce consequences that cannot be predicted adequately from event kind alone. A later confirmatory field should be justified by that decomposition, not tuned to make Gamma win.

## Boundary

Rebinding is a diagnostic matched-context control, not a new Gamma candidate. It uses the current context available at prediction time but never uses the held-out actual consequence.
