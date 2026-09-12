# EL-EXP-REEL-001 — FINAL PREREGISTERED PROCEDURE

**Stage:** Emergence Lab Stage 2  
**Canonical runtime:** `stage2/reel-001/EL-EXP-REEL-001_FACTORIAL.html`  
**Initial seed:** 42  
**Status:** Review before launch. Do not tune parameters during the run.

## 1. Research question

Does a selective environmental exposure have a different persistent effect when node-to-node transfer efficiency is dynamically resonance-dependent than when transfer efficiency is held constant?

This tests a general feedback structure analogous to recommendation reinforcement. It does **not** claim to reproduce Instagram/Reels or any proprietary recommendation algorithm.

## 2. Architecture held fixed

\[
N_i=(X_i,Y_i,Z_{1i},Z_{2i},\Theta_i)
\]

- `X`: structured identity/persistent state.
- `Y`: structured memory/perceptual state.
- `Z1`: structured recoil/recovery response.
- `Z2`: structured integration/transfer response.
- `Theta`: frequency, phase, amplitude, coherence.

Excluded: Mati, radials, orbitals, anatomical resonance rings, restored-anatomy rendering, Gamma as a causal variable, and any standalone node-energy coordinate.

## 3. Candidate transfer mechanism

Resonance-mediated arms use:

\[
\eta_{ij}=S_\Theta(i,j),\qquad C_{ij}=1-S_\Theta(i,j).
\]

Frozen-efficiency arms use:

\[
\eta_{ij}=\bar S_\Theta(0),
\]

where the value is computed once from the common Tick-0 state and held constant.

These are candidate Stage 2 equations, not physical laws.

## 4. Factorial design

| Arm | Transfer mechanism | Selective Tick-51 pulse |
|---|---|---|
| A | resonance-mediated | yes |
| B | resonance-mediated | no |
| C | frozen efficiency | yes |
| D | frozen efficiency | no |

All four arms start from exactly the same seeded node state and receive the same deterministic **base** environmental forcing at every tick.

At Tick 51 only A and C receive the additional Node-1 pulse. B and D receive base forcing only.

### Primary causal contrast

For any predeclared observable \(M\):

\[
\Delta_R=M_A-M_B
\]

is the pulse effect under resonance-mediated transfer,

\[
\Delta_F=M_C-M_D
\]

is the pulse effect under frozen efficiency, and

\[
\boxed{I_M=(M_A-M_B)-(M_C-M_D)}
\]

is the mechanism-by-pulse interaction.

The interaction is the primary result. It prevents ordinary pre-intervention divergence between the resonance and frozen mechanisms from being mistaken for an effect of the selective exposure.

## 5. Environmental forcing and bookkeeping

Environmental disorder = `0.75`  
Base perturbation = `0.32`  
Selective pulse tick = `51`  
Selective pulse node = `1`  
Pulse excitation = `0.85`  
Pulse pattern = `[0.92, 0.18, 0.74]`

Excitation is auxiliary interaction flow, not a node coordinate. The runtime checks:

\[
E_{available}=E_{dissipated}+E_{work}+E_{carried}
\]

up to floating-point tolerance.

`Energy`, `work`, `dissipation`, and `environmental disorder` are computational bookkeeping terms here. They do not establish physical thermodynamic equivalence.

## 6. Fixed tick semantics

Each tick executes in this order:

1. Generate deterministic base environmental forcing from seed + tick.
2. Clone that same base forcing for all four arms.
3. Add the selective pulse to A and C only when tick = 51.
4. Apply local environmental forcing.
5. Freeze each arm's complete pre-interaction state.
6. Calculate every pairwise edge from that frozen state.
7. Accumulate transfer, mismatch, work, and Theta coupling.
8. Apply all accumulated state effects simultaneously.
9. Advance exactly one integer tick.
10. At a checkpoint, serialize the state and pause.

No scientific update is allowed to depend on display frame rate or node iteration order.

## 7. Predeclared observables

At every checkpoint export complete state plus:

- mean X
- mean Y
- mean Z1
- mean Z2
- mean pairwise Theta similarity
- Theta-similarity variance
- current carried excitation (`flow`)
- cumulative environmental input
- cumulative transferred excitation
- cumulative dissipated excitation
- cumulative work
- pathway concentration
- excitation-accounting residual
- pulse count per arm
- pulse effect A-B
- pulse effect C-D
- factorial interaction (A-B)-(C-D)

The interaction is reported for mean Theta similarity, pathway concentration, retained flow, cumulative dissipation, and cumulative work.

## 8. Fixed checkpoints

\[
t=0,25,50,75,100,150.
\]

The runtime automatically pauses at 25, 50, 75, 100, and 150. The intervention occurs automatically at Tick 51, immediately after the Tick-50 baseline pause is resumed.

## 9. Exact operator procedure

### A. Pre-launch verification

1. Use repository `leonardodecreative/EmergenceLab` and branch `stage2/reel-001`.
2. Serve directory `stage2/reel-001/` through a static HTTP server.
3. Open **only** `EL-EXP-REEL-001_FACTORIAL.html`.
4. Confirm the page says `FINAL PREREGISTERED 2×2 FACTORIAL RUNTIME`.
5. Confirm `READY / PAUSED` and Tick `0`.
6. Confirm Seed `42`.
7. Confirm `4` nodes per arm.
8. Confirm the four labels exactly: A resonance/pulse; B resonance/no pulse; C frozen/pulse; D frozen/no pulse.
9. Confirm intervention says `Tick 51 → Node 1`.
10. Confirm the Integrity line says **PASS**.
11. Confirm pulse counts are `0/0/0/0`.
12. Confirm A=B and C=D are both `YES`.
13. Visually verify all four arms have the same Tick-0 node values.
14. Press **Export JSON**. Save the Tick-0 export.
15. Do not edit source, seed, or parameters after this point.

### B. Baseline 0 → 25

16. Press **Start** once.
17. Allow automatic pause at Tick 25.
18. Confirm `READY / PAUSED`, Tick `25`, Integrity **PASS**.
19. Confirm A=B and C=D remain `YES`.
20. Confirm pulse counts remain `0/0/0/0`.
21. Record observations only. Do not interpret.
22. Export JSON.

### C. Baseline 25 → 50

23. Press **Start** once.
24. Allow automatic pause at Tick 50.
25. Confirm Integrity **PASS**.
26. Confirm A=B and C=D remain `YES`.
27. Confirm pulse counts remain `0/0/0/0`.
28. Confirm the run log contains no Tick-51 intervention entry.
29. Record observations only.
30. Export JSON.

### D. Intervention 50 → 75

31. Press **Start** once.
32. At Tick 51 the runtime automatically adds the selective pulse to Node 1 in A and C only.
33. Do not touch any control while the interval runs.
34. Allow automatic pause at Tick 75.
35. Confirm Integrity **PASS**.
36. Confirm pulse counts are exactly `1/0/1/0` for A/B/C/D.
37. Confirm the log contains one Tick-51 intervention entry.
38. Record observations only, including A-B, C-D, and the displayed interaction terms.
39. Export JSON.

### E. Follow-up 75 → 100

40. Press **Start** once.
41. Allow automatic pause at Tick 100.
42. Confirm Integrity **PASS** and pulse counts remain `1/0/1/0`.
43. Record observations only.
44. Export JSON.

### F. Follow-up 100 → 150

45. Press **Start** once.
46. Allow automatic pause at Tick 150.
47. Confirm Integrity **PASS** and pulse counts remain `1/0/1/0`.
48. Record observations only.
49. Export JSON.
50. **STOP. Do not resume beyond Tick 150 for the preregistered run.**

## 10. Observation versus interpretation

Allowed during execution:

- “A-B pathway concentration is ___.”
- “C-D retained-flow difference is ___.”
- “The factorial interaction for mean Theta similarity is ___.”
- “Node 1 Y in Arm A changed from ___ to ___.”

Not allowed until the Tick-150 export is secured:

- “The nodes learned.”
- “The system formed a preference.”
- “Resonance proved the Reel mechanism.”
- “The nodes optimized energy.”

## 11. Result classes

### R1 — persistent mechanism-specific feedback

The pulse produces a nonzero mechanism-by-pulse interaction after Tick 51 that remains directionally persistent through Tick 150 on one or more predeclared organization/flow observables, with protocol integrity intact.

Narrow supported statement: under these explicit model rules, selective exposure has a persistent effect that differs according to whether transfer is resonance-dependent.

### R2 — transient mechanism-specific response

The interaction appears after the pulse but contracts substantially toward zero by Tick 150.

Narrow supported statement: the mechanism changes perturbation response but persistent reinforcement is not supported under these parameters.

### R3 — pulse response without mechanism interaction

A-B and C-D show pulse effects, but their difference is approximately zero.

Narrow supported statement: the system responds to selective exposure, but resonance-dependent transfer did not materially change that response under these parameters.

### R4 — no meaningful pulse response

Both A-B and C-D remain approximately zero after Tick 51.

Narrow supported statement: this intervention failed to produce measurable persistent differentiation under the tested parameters.

### R5 — invalid run

Invalidate the run if any of the following occurs:

- wrong runtime is opened;
- any arm fails to begin from the common Tick-0 state;
- A differs from B or C differs from D before Tick 51;
- pulse counts are not 0/0/0/0 before Tick 51;
- pulse counts are not 1/0/1/0 afterward;
- checkpoint pauses at the wrong tick;
- material excitation-accounting error occurs;
- source, seed, or parameters are changed after baseline lock;
- any uncontrolled manual intervention occurs.

## 12. Replication rule

Seed 42 is the first preregistered run. No parameter tuning based on its outcome is allowed before the first-run interpretation and replication decision are recorded.

A later replication series should predeclare multiple seeds and rotate the pulse target across nodes to prevent Node-1-specific behavior from being mistaken for a general effect.

## 13. Claim boundary

A positive result is evidence about this computational model under its stated rules. It does not establish consciousness, intelligence, biological equivalence, physical thermodynamic validity, or equivalence to any proprietary recommendation system.
