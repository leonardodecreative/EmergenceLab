# EL-EXP-GAMMA-004 v1.8 — Ledger/Lens Tandem Candidate

Status: **candidate protocol frozen before official execution**

## Question

Did v1.7's Dual arm fail because it averaged two distinct operations into one diluted payload? This experiment tests whether keeping a consequence/action ledger and a read/perception lens computationally distinct, then routing rather than blending their channel-level outputs, improves held-out prediction.

This does **not** assume that Γ or Λ is a natural law. It tests one bounded realization. Failure rejects this realization, not the entire ledger/lens architecture class.

## Operators

- **Γ Ledger:** the v1.7 write-context model, re-expressed in the current context frame before scoring. It represents settled causal/action history.
- **Λ Lens:** the v1.7 read-context model, also expressed in the current context frame. Its separate state records the recent predictive error of ledger and lens interpretations by event kind and consequence channel.
- **Legacy Dual:** the v1.7 convex interpolation. It is retained as the dilution control.
- **Tandem Selector:** no convex averaging. For each event kind and typed-consequence channel, Λ selects the historically lower-error expert after four observations. Ties and insufficient history deterministically select Γ.

Λ is a provisional symbol and the selector is a candidate mechanism—not a claim that perception itself has been fully modeled.

## Frozen arms

1. Event-type-plus-strength ordinary baseline.
2. Γ Ledger alone.
3. Λ Lens alone.
4. Legacy Dual blend.
5. Γ/Λ Tandem Selector.

All arms see the same events, factual/counterfactual consequence measurements, schedules, archive capacity, and 30 seeds. Predictions are made before the current event outcome is observed. Every arm may update only after settlement, preserving the sequential forecasting contract.

## Primary score

The primary score is seed-level **macro event-stratified RMSE**:

\[
\operatorname{RMSE}_{macro,s}
=
\sqrt{\frac{1}{K}\sum_{k=1}^{K}\operatorname{RMSE}_{s,k}^{2}}
\]

Each event kind receives equal weight. Micro-pooled RMSE remains descriptive only because DIAG-002 showed that `RECOVERY_SHOCK` dominated roughly 85% of baseline squared error.

For comparator \(b\), seed-level proportional improvement is:

\[
I_{s,b}=\frac{\operatorname{RMSE}_{s,b}-\operatorname{RMSE}_{s,T}}{\operatorname{RMSE}_{s,b}}
\]

where \(T\) is the Tandem Selector.

## Advancement gates

All substantive gates must pass:

1. Tandem macro improvement is at least 5% over event-type-plus-strength.
2. Tandem macro improvement is at least 5% over **both** single operators.
3. Tandem macro improvement is at least 5% over Legacy Dual.
4. No event kind degrades by more than 10% relative to the better single operator for that kind.
5. Exact two-sided seed-level sign tests favor Tandem against all four comparators under Bonferroni \(\alpha=0.05/4=0.0125\).
6. A byte-equivalent independent Codex C replication must match Bobby B's rounded scientific hash before advancement.

Passing gates 1–5 yields only `PENDING_INDEPENDENT_REPLICATION_TANDEM_V1_8`. Gate 6 is adjudicated separately.

## Fixed mechanism

- Λ error update: exponentially weighted squared error, decay 0.90.
- Separate reliability state per node, event kind, consequence channel, and expert.
- Initial error 1.0.
- Minimum observations before routing: 4 per expert/channel.
- Deterministic Γ fallback for ties and cold start.
- Scientific values rounded to 12 decimals for cross-runtime hashing.
- Bobby B runs first; Codex C runs second.

## Seeds

The 30 official candidate seeds are embedded in the source and runners. Commissioning seed `3141592653` is excluded from the official set. Commissioning output is non-evidentiary.

## Interpretation boundaries

A pass would show that preserving and conditionally routing the two v1.7 interpretations is operationally superior under this field. It would not prove that human thought is parallel, that Γ/Λ are ontologically real, or that the operator symbols are final.

A failure would mean the tested hard selector did not earn its computational cost. It would leave untested other tandem relations—multiplication, residual correction, hierarchical gating, different-timescale archives, or a genuinely independent perception stream.
