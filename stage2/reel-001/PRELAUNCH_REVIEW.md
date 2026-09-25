# EL-EXP-REEL-001 — Prelaunch Review Record

## Review 1 — scientific design

- Stage 1 remains frozen.
- Restored-anatomy V2 remains separate.
- Core state is `N=(X,Y,Z1,Z2,Theta)`; no standalone `E` coordinate.
- Gamma is excluded as a causal variable in this first Stage 2 test.
- Environmental excitation is normalized computational forcing/bookkeeping, not claimed physical joules.
- `eta_ij = S_Theta(i,j)` and `C_ij = 1-S_Theta(i,j)` are explicitly candidate laws.
- Synchronous within-tick updates remove node iteration order as a hidden causal variable.
- The original two-arm design was rejected because resonance-vs-frozen mechanisms can diverge before the intervention.
- Final design is 2×2: A resonance+pulse, B resonance+no pulse, C frozen+pulse, D frozen+no pulse.
- Primary causal contrast is `(A-B)-(C-D)`.

**Review 1 disposition:** satisfactory for operator smoke-check; no architecture addition required.

## Review 2 — protocol/artifact consistency

- Canonical runtime uniquely named `EL-EXP-REEL-001_FACTORIAL.html`.
- `index.html` and `EL-EXP-REEL-001.html` explicitly marked superseded.
- README, protocol, GitHub Stage 2 white paper, and Drive Stage 2 white paper identify the factorial design.
- Seed 42, four nodes per arm, Tick-51 Node-1 pulse, and checkpoints 0/25/50/75/100/150 agree across runtime and protocol.
- Before Tick 51 the runtime requires A=B and C=D.
- After Tick 51 the required pulse counts are A/B/C/D = 1/0/1/0.
- Runtime exports complete state, arm telemetry, checkpoint snapshots, integrity status, pulse effects, and factorial interactions.
- Excitation accounting is checked against floating-point tolerance.
- Observation/interpretation separation and no-mid-run-tuning rule are included in protocol.

**Review 2 disposition:** documentation and causal design are internally consistent. The remaining gate is the operator's in-browser Tick-0 smoke-check before Start; this review does not claim that a browser execution has already occurred.
