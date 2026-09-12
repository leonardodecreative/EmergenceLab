# EL-EXP-GAMMA-003-DIAG-002 — Residual Causal Heterogeneity

**Status:** Exploratory, post-confirmatory. The frozen v1.7 verdict is unchanged.

All predictions use leave-one-seed-out fitting: the evaluated seed never contributes to its model coefficients.

## Held-out models

| Model | Typed RMSE | Pooled improvement vs event type | Seeds + / − / tie | Sign p |
| --- | ---: | ---: | ---: | ---: |
| eventType | 0.005773688 | 0.000% | 0 / 0 / 30 | 1 |
| eventTypeStrength | 0.005131329 | 11.126% | 30 / 0 / 0 | 1.86265e-09 |
| eventActorTarget | 0.005147974 | 10.837% | 30 / 0 / 0 | 1.86265e-09 |
| eventContext | 0.005123673 | 11.258% | 30 / 0 / 0 | 1.86265e-09 |
| fullInteraction | 0.005072790 | 12.140% | 30 / 0 / 0 | 1.86265e-09 |

## Increment beyond event type plus strength

| Candidate addition | Pooled improvement | Seeds + / − / tie | Mean seed 95% CI | Sign p |
| --- | ---: | ---: | ---: | ---: |
| eventActorTarget | -0.324% | 5 / 25 / 0 | [-0.461%, -0.194%] | 0.000324914 |
| eventContext | 0.149% | 14 / 16 / 0 | [-0.121%, 0.360%] | 0.855536 |
| fullInteraction | 1.141% | 17 / 13 / 0 | [-0.209%, 2.337%] | 0.584665 |

## Full-interaction result by event kind

| Event kind | Events | Event-type RMSE | Full RMSE | Improvement |
| --- | ---: | ---: | ---: | ---: |
| SUPPORT_MEMORY | 900 | 0.004573241 | 0.004454841 | 2.589% |
| ERODE_MEMORY | 900 | 0.001207382 | 0.002302204 | -90.677% |
| ALIGN_THETA | 900 | 0.000146077 | 0.002662138 | -1722.423% |
| DISRUPT_PHASE | 900 | 0.002674727 | 0.002358134 | 11.836% |
| INTEGRATION_PULSE | 900 | 0.000898937 | 0.002445164 | -172.006% |
| RECOVERY_SHOCK | 900 | 0.013025241 | 0.010517928 | 19.250% |

## Boundary

Linear held-out-seed decomposition only. Failure to gain from these features does not prove that nonlinear or longer-horizon context is irrelevant.
