# EL-EXP-GAMMA-002 v1.6 Preregistration

## Circular Phase Retrieval Repair

**Status:** Preregistered candidate protocol. No confirmatory run has occurred.

**Architecture boundary:** Noncausal Gamma prediction only. This experiment does not modify the canonical node, the canonical engine, or any equation governing `X`, `Y`, `Z1`, `Z2`, or `Theta`.

**Replication order:** Bobby B first. Codex C second. Version A is reserved for adjudicating a material B/C discrepancy.

## 1. Prior evidence and nomination rule

The frozen EL-EXP-GAMMA-001 v1.5 N=30 evaluation detected a small positive predictive contribution from consequential history but failed its practical advancement margins. A post-result diagnostic decomposition was permitted only to nominate one v1.6 repair.

The diagnostic reproduced every sealed final-world digest and both pooled primary RMSE values. It found:

- Relational Gamma outperformed dyadic Gamma in 30 of 30 seeds, with 31.85% pooled improvement.
- The Theta consequence family showed 8.72% pooled improvement and favored Gamma in 29 of 30 seeds.
- `DISRUPT_PHASE` showed 8.08% pooled improvement and favored Gamma in 29 of 30 seeds.
- `ALIGN_THETA` showed -1.76% pooled improvement and favored Gamma in only 7 of 30 seeds.

The v1.5 family-balanced signature distance treats all coordinates as linear. Normalized phase is circular. For example, phases 0.99 and 0.01 are separated by 0.02 on the circle but by 0.98 under ordinary absolute distance. The sole nominated v1.6 repair is therefore a circular metric for phase coordinates during Gamma signature retrieval.

## 2. Frozen research question

Does replacing linear phase distance with circular phase distance improve the out-of-sample predictive value of relational consequential-history retrieval while preserving all other v1.5 equations, parameters, controls, and experimental boundaries?

## 3. Candidate equation

For normalized phase coordinates `a` and `b` in `[0,1]`, define:

```math
\delta_{circ}(a,b)=\min\left(|a-b|,\ 1-|a-b|\right)
```

For every non-phase signature coordinate:

```math
\delta_{linear}(a,b)=|a-b|
```

The existing family RMS calculation remains:

```math
d_f(a,b)=\sqrt{\frac{1}{|f|}\sum_{j\in f}\delta_j(a_j,b_j)^2}
```

The existing family-balanced signature distance remains:

```math
d(a,b)=\frac{1}{F}\sum_{f=1}^{F}d_f(a,b)
```

The existing Gaussian kernel remains:

```math
k(a,b)=\exp\left(-\frac{d(a,b)^2}{2\sigma^2}\right)
```

Only the component metric for normalized phase coordinates changes.

## 4. Frozen phase indices

The v1.5 signature is composed of target context, actor state, dyad, and event descriptor fields. Circular distance applies only to:

- Target `Theta.phase.0`, `Theta.phase.1`, and `Theta.phase.2`: signature indices 10, 11, and 12.
- Actor `Theta.phase.0`, `Theta.phase.1`, and `Theta.phase.2`: signature indices 33, 34, and 35.

All indices are zero-based. No frequency, amplitude, coherence, dyad, event, or consequence coordinate receives circular treatment.

## 5. Frozen constants

| Parameter | Value |
| --- | ---: |
| Nodes | 6 |
| Warmup | 30 ticks |
| Acquisition events | 360 per seed |
| Held-out test events | 180 per seed |
| Factual/counterfactual horizon | 10 |
| Archive capacity | 48 records per target node |
| Kernel bandwidth `sigma` | 0.015 |
| Epsilon | `1e-9` |
| Recency window | 8 |
| Strength levels | 0.12, 0.20, 0.28 |
| Consequence representation | Signed 23-channel vector |
| Floating-point scientific hashing | Round to 12 decimal places |
| Alpha | 0.05 |

No parameter tuning is permitted after either B or C sees confirmatory results.

## 6. Frozen confirmatory seeds

Seeds were generated before implementation by taking the first four bytes, big-endian, of:

```text
SHA256("EL-EXP-GAMMA-002-v1.6.0|confirmatory-seed|" + positive_integer_index)
```

Duplicates and Seeds 1-30, 103, 449, and 871 were excluded. The resulting ordered set is:

```text
1620122227, 1121900541, 1167345866, 635455088, 152170300,
1993643838, 2915565139, 4081553161, 2794246745, 2714469569,
2033920072, 3841220894, 1220063660, 1227375349, 3632021282,
2931948358, 3259612167, 3534294265, 473552552, 1667527166,
3033302128, 1860056755, 718053086, 1106706679, 1924554172,
1273162433, 3633298885, 2256554411, 2593750757, 391362109
```

These seeds may not be replaced because of runtime, result direction, or apparent outlier behavior. A genuine execution failure must be documented and adjudicated before any replacement rule is introduced.

## 7. Models and controls

The following v1.5 comparators remain frozen:

- Zero prediction.
- Recency mean.
- Event-type mean (`typeMean`).
- Actor-event-type mean (`pairTypeMean`).
- State-only kernel.
- Shuffled relational Gamma.
- Linear-phase relational Gamma v1.5, run on the same fresh seeds.
- Circular-phase relational Gamma v1.6.

The principal candidate is circular-phase relational Gamma. Dyadic Gamma remains a secondary descriptive model and cannot replace the relational primary endpoint.

## 8. Commissioning tests required before Bobby B

The implementation must pass all v1.5 commissioning tests plus:

1. `deltaCircular(0.99, 0.01) = 0.02` within floating-point tolerance.
2. `deltaCircular(0.01, 0.99) = 0.02` within floating-point tolerance.
3. `deltaCircular(0.25, 0.75) = 0.50`.
4. Linear coordinates remain byte-identical to v1.5 distance calculations.
5. A signature differing only across the phase wrap boundary is closer under v1.6 than v1.5.
6. A signature differing only in frequency is unchanged between v1.5 and v1.6.
7. Event schedules, factual worlds, counterfactual worlds, measured consequences, archive writes, and final-world digests remain identical between linear and circular candidates for the same seed.
8. Only Gamma predictions and their derived metrics may differ.
9. Disabled-Gamma and empty-archive behavior remain unchanged.
10. Rounded cross-runtime scientific hashes match between the B and C commissioning runs.

Commissioning uses Seed 13579 only and is non-evidentiary.

## 9. Primary endpoints

The primary error measure remains pooled family-balanced RMSE across all 5,400 held-out test events.

Circular-phase Gamma advances only if every condition below is satisfied:

1. Circular Gamma improves at least 5.00% over the best prespecified ordinary control by pooled balanced RMSE.
2. Circular Gamma improves at least 10.00% over shuffled relational Gamma by pooled balanced RMSE.
3. Circular Gamma improves over matched linear-phase Gamma v1.5 in a positive seedwise direction under an exact two-sided sign test at `alpha = 0.05`.
4. The seedwise circular-Gamma improvement over the best ordinary control is positive under an exact two-sided sign test at `alpha = 0.05`.
5. Bobby B and Codex C agree after 12-decimal rounding on configuration hash, seed order, per-seed scientific payloads, pooled metrics, decision, and final scientific hash.

Failure of any condition yields `DO_NOT_ADVANCE_CIRCULAR_PHASE_GAMMA_V1_6`.

## 10. Secondary endpoints

The following are reported but cannot rescue a failed primary decision:

- Seed-level mean and median improvement with 95% t interval.
- Positive-seed rate with 95% Wilson interval.
- Exact sign data against ordinary, shuffled, and linear-Gamma controls.
- RMSE, cosine similarity, and sign agreement.
- `ALIGN_THETA` and `DISRUPT_PHASE` event-class results.
- Theta-family and phase-channel results.
- Strength-level results.
- Archive sizes, consequence magnitudes, and final-world digests.

## 11. Interpretation rules

- Passing supports the circular phase metric as a better noncausal retrieval realization. It does not itself establish meaning, moral valuation, consciousness, or a causal Gamma role.
- Failing rejects only this circular-distance repair under the frozen field.
- A passing noncausal result authorizes drafting a separate preregistered causal experiment. It does not authorize silently modifying the canonical engine.
- No subgroup result may override the aggregate primary decision.

## 12. Artifact requirements

Both B and C must preserve:

- Exact source files and SHA-256 manifest.
- Runtime and operating-system versions.
- Commissioning output.
- Per-seed result JSON.
- Aggregated summary JSON.
- Exact sign-test inputs and outputs.
- Rounded scientific payload and SHA-256.
- Human-readable decision report.

## 13. Frozen status

This protocol becomes frozen when its SHA-256 is entered into the experiment manifest before implementation begins. Any later amendment must receive a new protocol version and must remain visible in the record.
