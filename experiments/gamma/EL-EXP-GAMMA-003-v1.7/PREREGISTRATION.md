# EL-EXP-GAMMA-003 v1.7 Preregistration

## Context-Consequence Meaning Factorial

**Status:** Candidate protocol frozen before confirmatory execution.

**Architecture boundary:** Noncausal prediction only. No result from this experiment directly modifies `X`, `Y`, `Z1`, `Z2`, `Theta`, coupling, the identity-write gate, or the canonical engine.

**Replication order:** Bobby B first; Codex C second; Version A adjudicates any material discrepancy.

## 1. Correction inherited from v1.6

Gamma v1.6 already stores a signed 23-channel consequence vector. v1.7 therefore does not claim to introduce non-scalar or typed consequence. Its new object is a fixed context-consequence tensor used as a structural proxy for meaning.

The term *meaning* in this protocol does not denote moral truth, subjective consciousness, pleasure, pain, or researcher-assigned good and bad. It denotes an explicit binding between measured consequence type and the node context in which that consequence is interpreted.

## 2. Frozen research question

When predicting the structural meaning of a held-out event, does performance depend on whether context is bound to consequence at archive write, reconstructed at retrieval, or combined through both operations?

## 3. Consequence typing

The existing 23 consequence channels remain unchanged and are partitioned into the seven v1.6 families: `X`, `Y`, `Z1`, `Z2`, `Theta`, `Relation`, and `Environment`.

For each family `f`, v1.7 records its signed mean and RMS magnitude:

```math
T_f(c)=\left(\frac{1}{|f|}\sum_{j\in f}c_j,\sqrt{\frac{1}{|f|}\sum_{j\in f}c_j^2}\right)
```

The resulting typed-consequence vector has width 14.

## 4. Structural meaning proxy

The seven-component context frame is the family mean of the pre-event target context:

```math
F_f(p)=\frac{1}{|f|}\sum_{j\in f}p_j
```

Meaning is the outer product:

```math
M(p,c)=F(p)\otimes T(c)
```

The fixed output width is `7 x 14 = 98`. No learned coefficient, moral label, desired setpoint, or positive/negative annotation is introduced.

## 5. Frozen arms

All arms predict the same settled target `M(pre-event context, measured consequence)`.

1. `consequenceOnly`: retrieved consequence type bound to an all-ones neutral frame.
2. `writeMeaning`: retrieve the context-consequence tensor stored when the historical event settled.
3. `readMeaning`: retrieve historical consequence type and bind it to the present pre-event context.
4. `dualMeaning`: for each retrieved entry, interpolate between stored and present binding using the RMS distance between the stored and present seven-family context frames. Zero distance yields write meaning; increasing distance increases reinterpretation.

Shared ordinary controls are zero meaning, event-type mean meaning, and actor-event-type mean meaning. `consequenceOnly` is the no-meaning architecture baseline. The three candidate arms are `writeMeaning`, `readMeaning`, and `dualMeaning`. Every candidate arm has a deterministic shuffled-history comparator.

## 6. Frozen field

The v1.6 dynamics and all field constants remain unchanged: 6 nodes, 30 warmup ticks, 360 acquisition events, 180 held-out test events, horizon 10, archive capacity 48, circular phase distance, kernel bandwidth 0.015, epsilon `1e-9`, recency window 8, and strengths 0.12, 0.20, and 0.28.

Thirty fresh seeds were derived from the first four big-endian bytes of:

```text
SHA256("EL-EXP-GAMMA-003-v1.7.0|confirmatory-seed|" + positive_integer_index)
```

The ordered seeds are:

```text
2218981198, 1929771240, 521111220, 474297633, 4029016462,
1625019350, 1874816109, 3120607361, 578642397, 227299706,
1391291206, 3053689021, 2331380888, 2126422385, 334384799,
3810492981, 3259331138, 3650900357, 819091887, 4282557554,
1815008022, 2006204464, 461026791, 4259554234, 2244171520,
633117649, 3286174494, 327216863, 1656501849, 1624271877
```

Commissioning Seed 246813579 is excluded and non-evidentiary.

## 7. Primary endpoint and selection rule

The primary error measure is pooled RMSE over the fixed 98-component meaning target. For each of the three candidate arms, advancement requires all of:

1. At least 5.00% pooled improvement over the best shared ordinary control.
2. At least 10.00% pooled improvement over its shuffled-history comparator.
3. Positive seedwise direction against the no-meaning `consequenceOnly` arm under an exact two-sided sign test with Bonferroni threshold `0.05 / 3 = 0.0166666667`.
4. Positive seedwise direction against the best ordinary control at the same threshold.
5. Positive seedwise direction against its shuffled comparator at the same threshold.
6. Bobby B and Codex C agreement after 12-decimal canonical rounding.

If no arm passes, the verdict is `DO_NOT_ADVANCE_MEANING_FACTORIAL_V1_7`.

If multiple arms pass, the arm with the lowest pooled RMSE is provisionally selected. The full pairwise candidate matrix must still be reported; no claim that two meaning processes interact synergistically is permitted unless the dual arm exceeds both single arms and its factorial interaction contrast is positive.

## 8. Interpretation boundary

A passing arm supports only this structural context-consequence representation under this field. It does not establish phenomenological meaning, moral valuation, consciousness, or a canonical Gamma role. Failure rejects only these fixed encodings and retrieval placements. The rival hypothesis that meaning is stored as an intrinsic event property remains open for a separately preregistered architecture.

## 9. Cross-runtime fingerprinting

Every world fingerprint must hash the canonical world after rounding all finite numerical values to 12 decimal places. Raw floating-point state must never be used as the cross-runtime fingerprint.
