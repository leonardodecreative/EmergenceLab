# EL-EXP-GAMMA-001 calibration record

Calibration source: excluded seed `13579` only.  
Official seeds inspected: none.  
Purpose: verify the instrument and freeze provisional kernel bandwidth and archive capacity before Version B.

## Defects found and repaired before freeze

1. A target-only signature erased the distinction between A→B and C→B. Actor state and dyadic relation were added; signature width became 49.
2. The first intervention field was dominated by nearly fixed additive effects, allowing event-type mean to solve the task. Interventions were made dependent on actor state, target state, alignment, saturation, and available recovery/integration capacity. Gamma never enters those event laws.
3. The first candidate asked a Gamma *contribution* to predict the full consequence from zero. The repaired candidate predicts the contextual residual beyond an event-type baseline. The shuffled-history null receives the identical baseline.
4. A canonical-run guard was added: altered parameters or substituted seeds force `INVALID_RUN`.

Each repair preceded any official run. Build IDs were advanced after every material change.

## Final calibration grid

Horizon remained fixed at 10. Sigma and capacity were evaluated on the excluded seed. The final choice minimized the primary Gamma model's absolute balanced RMSE; the advancement thresholds were not reduced.

| Sigma | Capacity | Gamma RMSE | Best control RMSE | Improvement | Vs shuffled |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0.015 | 48 | 0.00637153 | 0.00656710 | 2.98% | 6.71% |
| 0.020 | 48 | 0.00637755 | 0.00656710 | 2.89% | 7.29% |
| 0.030 | 48 | 0.00643420 | 0.00656710 | 2.02% | 2.84% |
| 0.020 | 96 | 0.00644758 | 0.00668743 | 3.59% | 7.17% |
| 0.015 | 96 | 0.00646738 | 0.00668743 | 3.29% | 6.69% |

Selected: `sigma = 0.015`, `archiveCapacity = 48`.

The excluded seed did not clear the official 5% over-control and 10% over-shuffled thresholds. That is recorded, not hidden. The official experiment remains capable of returning either result; no parameter may now be changed without relabeling the run exploratory.

