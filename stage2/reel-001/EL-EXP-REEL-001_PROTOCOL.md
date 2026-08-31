# EL-EXP-REEL-001 — Preregistered Procedure

**Stage:** Emergence Lab Stage 2  
**Runtime:** `stage2/reel-001/EL-EXP-REEL-001.html`  
**Status before execution:** DO NOT LAUNCH until operator review is complete.

## 1. Research question

Can the lean Stage 2 node system produce a persistent feedback asymmetry in which a small selective environmental exposure changes internal state, that state changes later resonance-mediated transfer efficiency, and the changed transfer pattern alters subsequent exposure/interaction history?

This is a structural analogy to a recommendation-feedback loop. It is **not** a claim that the program reproduces Instagram/Reels or any proprietary recommendation algorithm.

## 2. Architecture held fixed

\[
N_i=(X_i,Y_i,Z_{1i},Z_{2i},\Theta_i)
\]

- `X`: structured identity state.
- `Y`: structured memory/perceptual state.
- `Z1`: structured recoil/recovery response.
- `Z2`: structured integration/transfer response.
- `Theta`: frequency, phase, amplitude, coherence.

Excluded from this experiment: Mati, radials, orbitals, anatomical resonance rings, restored-anatomy rendering, Gamma as a causal variable, and any standalone node-energy coordinate.

## 3. Candidate mechanism under test

Experimental arm:

\[
\eta_{ij}=S_\Theta(i,j)
\]

\[
C_{ij}=1-S_\Theta(i,j)
\]

Control arm:

\[
\eta_{ij}=\bar S_\Theta(0)
\]

where the control efficiency is computed once from the Tick-0 mean pairwise Theta similarity and then frozen.

Both arms receive the same initial state and the same deterministic environmental forcing at every tick.

## 4. Environmental forcing and excitation bookkeeping

Environmental disorder = `0.75`.  
Base perturbation = `0.32`.  
A selective pulse is delivered automatically at Tick 51 to Node 1 with normalized excitation `0.85` and pattern `[0.92, 0.18, 0.74]`.

Excitation is not a node coordinate. The runtime records normalized computational flow:

\[
E_{available}=E_{dissipated}+E_{work}+E_{carried}
\]

for every source at every tick, up to floating-point error.

The labels `energy`, `work`, `dissipation`, and `entropy` in this experiment are model bookkeeping language and do not establish physical thermodynamic equivalence.

## 5. Fixed update order

Every tick executes in this order:

1. Generate the environmental forcing as a pure deterministic function of `seed + tick`.
2. Apply the identical forcing to both arms.
3. Freeze each arm's complete pre-interaction state.
4. Calculate every node-to-node edge from that frozen state.
5. Accumulate incoming transfer, mismatch, work, and Theta coupling.
6. Apply all accumulated node updates simultaneously.
7. Advance the integer tick by exactly one.
8. If the tick is a checkpoint, record and pause.

No scientific update depends on display frame rate or node iteration order.

## 6. Primary observables

At every checkpoint record both arms:

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
- excitation-accounting error
- complete serialized node state

The runtime also reports arm-to-arm differences in mean Theta similarity, pathway concentration, retained flow, dissipation, and work.

## 7. Predeclared checkpoints

\[
t=0,25,50,75,100,150
\]

The program automatically pauses at 25, 50, 75, 100, and 150. The selective exposure occurs at Tick 51, immediately after the Tick-50 baseline checkpoint when execution is resumed.

## 8. Exact operator procedure

### A. Before touching Start

1. Checkout branch `stage2/reel-001` from `leonardodecreative/EmergenceLab`.
2. Serve `stage2/reel-001/` through a static HTTP server.
3. Open **only** `EL-EXP-REEL-001.html`.
4. Confirm the header says `STAGE 2 / EL-EXP-REEL-001` and `synchronous fixed-tick dynamics`.
5. Confirm status is `READY / PAUSED` and Tick is `0`.
6. Confirm Seed is `42`.
7. Confirm Nodes = `4`.
8. Confirm scheduled pulse says `Tick 51 → Node 1`.
9. Confirm both arms show identical Tick-0 node values.
10. Confirm the log states paired initial states are identical and shows the frozen control efficiency.
11. Press **Export JSON** and save the Tick-0 file before execution.
12. Do not alter the seed or source code after this point.

### B. Baseline interval 0 → 25

13. Press **Start** once.
14. Allow the program to auto-pause at Tick 25.
15. Confirm status is `READY / PAUSED` and Tick = `25`.
16. Do not interpret. Record observable facts only.
17. Press **Export JSON**.

### C. Baseline interval 25 → 50

18. Press **Start** once.
19. Allow auto-pause at Tick 50.
20. Confirm Tick = `50`.
21. Record observations only.
22. Press **Export JSON**.
23. Verify the log does **not** yet contain the scheduled selective pulse.

### D. Intervention interval 50 → 75

24. Press **Start** once.
25. At Tick 51 the runtime automatically delivers the same selective environmental pulse to Node 1 in both arms.
26. Do not touch any control while the interval runs.
27. Allow auto-pause at Tick 75.
28. Confirm the log contains exactly one Tick-51 pulse entry.
29. Record observations only.
30. Press **Export JSON**.

### E. Follow-up intervals

31. Press **Start** → auto-pause Tick 100.
32. Record observations only; Export JSON.
33. Press **Start** → auto-pause Tick 150.
34. Record observations only; Export JSON.
35. **STOP. Do not resume beyond Tick 150 for the preregistered run.**

## 9. Observation language

Allowed during execution:

- “Mean Theta similarity in Arm A changed from ___ to ___.”
- “Node 1 Y differs from its Tick-50 value by ___.”
- “Pathway concentration is higher/lower in Arm A than Arm B by ___.”

Not allowed until after Tick 150:

- “The nodes learned.”
- “The cluster formed a preference.”
- “This proves the Reel algorithm.”
- “The nodes optimized energy.”

Those are interpretations or claims and belong in post-hoc analysis.

## 10. Preregistered result classes

### Result class A — persistent feedback differentiation

The post-pulse experimental arm develops a persistent trajectory difference from its paired control in pathway concentration and/or state organization, and that difference persists through Tick 150 rather than appearing only at Tick 51.

This would support the narrow statement that resonance-dependent local transfer can generate a persistent feedback asymmetry under the tested rules.

### Result class B — transient response only

The pulse produces measurable arm divergence that subsequently contracts toward baseline/control by Tick 150.

This supports perturbation sensitivity but not persistent reinforcement.

### Result class C — no meaningful arm divergence

The experimental and frozen-efficiency control trajectories remain effectively comparable after the pulse.

This fails to support the proposed reinforcement mechanism under these parameters.

### Result class D — numerical or protocol failure

Any of the following invalidates the run as evidence:

- nonzero excitation-accounting error beyond ordinary floating-point tolerance;
- arms do not begin from identical serialized states;
- pulse occurs at the wrong tick or more than once;
- checkpoint does not pause at the declared tick;
- source code or parameters are changed after Tick 0;
- an uncontrolled manual intervention occurs;
- the wrong HTML runtime is used.

## 11. Replication rule

Seed 42 is the commissioning/preregistered first run. No parameter tuning is allowed based on Seed-42 results before a replication decision is recorded.

If Stage 2 proceeds to replication, use a predeclared seed set and rotate the selective-pulse target across nodes rather than repeatedly privileging Node 1.

## 12. Claim boundary

A positive result would demonstrate behavior of this computational model under these explicit local rules. It would not establish consciousness, intelligence, physical thermodynamic validity, biological equivalence, or equivalence to a proprietary recommendation system.
