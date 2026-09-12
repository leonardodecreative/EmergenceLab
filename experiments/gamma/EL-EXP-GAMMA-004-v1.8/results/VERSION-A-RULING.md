# EL-EXP-GAMMA-004 v1.8 — Version A Ruling

## Adjudication

Bobby B and Codex C independently reproduced all three ten-seed batches and the complete N=30 scientific payload after the preregistered twelve-decimal rounding rule.

```text
Bobby B: 4b0d51b4f7774181bc805bc93d27b2059547412bbfcfe9c477b83d6c1dcd83bd
Codex C: 4b0d51b4f7774181bc805bc93d27b2059547412bbfcfe9c477b83d6c1dcd83bd
```

Independent replication passes. No discrepancy requires substantive arbitration.

## Frozen decision

Final verdict: **`DO_NOT_ADVANCE_TANDEM_V1_8`**.

The Tandem Selector passed only the worst-event-kind degradation bound. It failed the frozen magnitude gates against the ordinary event-type-plus-strength baseline, both single operators, and the legacy Dual blend. It also failed the familywise directional requirement.

Mean seed-level macro event-stratified RMSE:

| Arm | RMSE |
|---|---:|
| Event type + strength | 0.0013193867 |
| Γ Ledger | 0.0042353852 |
| Λ Lens | 0.0042350839 |
| Legacy Dual | 0.0042345890 |
| Tandem Selector | 0.0042372697 |

Tandem improvement was negative against every comparator: −221.15% against event type + strength, −0.0445% against Γ, −0.0516% against Λ, and −0.0633% against Legacy Dual.

Against the ordinary baseline, Tandem lost on 30/30 seeds; exact two-sided sign-test `p = 1.862645149230957e-9`. The other operator comparisons were unresolved at 14/16 or 16/14, each `p = 0.855535551905632`.

## Mechanical interpretation

The result does not show that parallel ledger/lens operation is incoherent. It shows that a hard reliability selector cannot rescue two nearly equivalent full-payload predictors when both omit a dominant ordinary predictor. DIAG-002 had already shown that event type plus strength explains most readily predictable consequence variation. v1.8 routed between Γ and Λ instead of modeling what remained after that baseline.

The next defensible candidate is therefore residual, not replacement architecture:

```math
\hat T = \hat T_{type+strength} + \Delta_\Gamma + \Delta_\Lambda
```

Γ and Λ should compete or cooperate only over held-out residual consequence unexplained by event type and strength. That proposal requires a fresh preregistration and must not be retrofitted into v1.8.

## Boundary

This ruling rejects the frozen v1.8 hard-selector realization. It does not eliminate Γ, Λ, a two-timescale architecture, multiplicative interaction, residual correction, hierarchical gating, or genuinely independent perception history.
