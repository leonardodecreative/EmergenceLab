# EL-EXP-GAMMA-001 v1.5 - Frozen N=30 Diagnostic Decomposition

**Status:** Exploratory and noncausal. This report does not modify the frozen v1.5 result or authorize Gamma integration.

## Validation and audit note

- All 30 final-world digests reproduce the sealed batch results.
- Pooled Gamma and typeMean RMSE reproduce the sealed N=30 aggregation.
- The frozen schedule executes the configured **360 acquisition events** followed by 180 held-out test events per seed.
- All subgroup tests are exploratory. Benjamini-Hochberg q-values are calculated separately within each diagnostic family.

## Overall reproduction

- Gamma vs typeMean pooled improvement: **2.37%**.
- Gamma vs shuffled pooled improvement: **8.65%**.
- Relational Gamma vs dyadic Gamma pooled improvement: **31.85%**.
- Seeds favoring relational over dyadic Gamma: **30 / 30**.

## Event-class decomposition

| Event | Pooled gain | Mean seed gain | Positive seeds | p | BH q |
| --- | --- | --- | --- | --- | --- |
| DISRUPT_PHASE | 8.08% | 7.90% | 29/30 | 5.774e-08 | 3.465e-07 |
| ERODE_MEMORY | 3.09% | 3.36% | 20/30 | 0.09874 | 0.1975 |
| RECOVERY_SHOCK | 1.60% | 1.56% | 17/30 | 0.5847 | 0.7016 |
| SUPPORT_MEMORY | 1.47% | 1.27% | 16/30 | 0.8555 | 0.8555 |
| INTEGRATION_PULSE | -0.93% | -0.89% | 13/30 | 0.5847 | 0.7016 |
| ALIGN_THETA | -1.76% | -2.04% | 7/30 | 0.005223 | 0.01567 |

## Consequence-family decomposition

| Family | Pooled gain | Mean seed gain | Positive seeds | p | BH q |
| --- | --- | --- | --- | --- | --- |
| Theta | 8.72% | 8.59% | 29/30 | 5.774e-08 | 4.042e-07 |
| Relation | 4.71% | 4.34% | 26/30 | 5.948e-05 | 0.0002082 |
| Z1 | 1.72% | 1.72% | 18/30 | 0.3616 | 0.5062 |
| Y | 1.60% | 1.52% | 18/30 | 0.3616 | 0.5062 |
| X | 1.41% | 1.37% | 19/30 | 0.2005 | 0.4678 |
| Z2 | 0.00% | 0.00% | 0/0 | 1 | 1 |
| Environment | 0.00% | 0.00% | 0/0 | 1 | 1 |

## Channel decomposition

| Channel | Pooled gain | Mean seed gain | Positive seeds | BH q |
| --- | --- | --- | --- | --- |
| Theta.frequency.2 | 58.61% | -12.01% | 25/30 | 0.0009341 |
| Theta.frequency.1 | 58.47% | 3.35% | 26/30 | 0.000228 |
| Theta.frequency.0 | 58.38% | 10.39% | 25/30 | 0.0009341 |
| Theta.phase.0 | 19.73% | 24.95% | 30/30 | 2.142e-08 |
| Theta.phase.1 | 14.98% | 22.39% | 30/30 | 2.142e-08 |
| Theta.phase.2 | 6.76% | 11.24% | 27/30 | 6.463e-05 |
| Relation.resonance | 4.80% | 4.42% | 26/30 | 0.000228 |
| Relation.thetaAlignment | 4.80% | 4.42% | 26/30 | 0.000228 |
| Theta.coherence | 1.96% | 1.98% | 21/30 | 0.1093 |
| Z1.recovery.0 | 1.76% | 1.76% | 17/30 | 0.8965 |
| Z1.recovery.1 | 1.67% | 1.66% | 19/30 | 0.4192 |
| Y | 1.60% | 1.52% | 18/30 | 0.594 |
| Relation.memory | 1.59% | 1.50% | 18/30 | 0.594 |
| X | 1.41% | 1.37% | 19/30 | 0.4192 |
| Z1.active | 0.00% | 0.00% | 0/0 | 1 |
| Z2.integration.0 | 0.00% | 0.00% | 0/0 | 1 |
| Z2.integration.1 | 0.00% | 0.00% | 0/0 | 1 |
| Theta.amplitude.0 | 0.00% | 0.00% | 0/0 | 1 |
| Theta.amplitude.1 | 0.00% | 0.00% | 0/0 | 1 |
| Theta.amplitude.2 | 0.00% | 0.00% | 0/0 | 1 |
| Relation.integration | 0.00% | 0.00% | 0/0 | 1 |
| Environment | 0.00% | 0.00% | 0/0 | 1 |
| Relation.recovery | -1.28% | -1.17% | 12/30 | 0.594 |

## Highest and lowest dyadic gains

| Dyad | Pooled gain | Mean seed gain | Positive seeds |
| --- | --- | --- | --- |
| 1->4 | 13.40% | 11.76% | 18/30 |
| 1->0 | 10.27% | 9.01% | 21/30 |
| 2->1 | 8.36% | 12.15% | 20/30 |
| 4->0 | 7.86% | 6.56% | 19/30 |
| 3->5 | 6.81% | 6.97% | 19/30 |
| 1->5 | -0.95% | -3.05% | 15/30 |
| 0->3 | -2.41% | -0.28% | 14/30 |
| 3->0 | -4.33% | -6.18% | 9/30 |
| 2->5 | -4.87% | -5.96% | 16/30 |
| 4->5 | -8.64% | -6.24% | 14/30 |

## Seeds favoring typeMean overall

1, 5, 6, 8, 13, 14, 16, 29

## Interpretation boundary

These decompositions locate predictive gain inside the existing v1.5 output. They do not establish causal benefit, subjective meaning, or a canonical Gamma law. A v1.6 change must be nominated before fresh testing and may not be selected by repeatedly optimizing against these same 30 seeds.

Scientific SHA-256: `bffcee877c6c91aca08f526e8856ec3b14c6cb4c67458b0298abe72843b848ab`
