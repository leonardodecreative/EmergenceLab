# EMERGENCE LAB — STAGE 2 WHITE PAPER

## Resonant Transfer, Environmental Forcing, Structured State, and Experimental Transition

**Revision:** Working Revision 2 — 31 August 2026  
**Boundary:** Begins after the close of the Stage 1 circulation paper. **Stage 1 remains frozen.**  
**Separate lineage:** The restored-anatomy V2 work — Mati, radials, orbitals, resonance rings, atom-inspired rendering, and associated visual anatomy — remains a separate document and implementation track. It is not merged into this Stage 2 paper.

---

## Abstract

Stage 2 moves Emergence Lab from an exploratory simulation lineage toward a deliberately structured and reproducible experimental system. Its adopted core node is

\[
\boxed{N_i(t)=\big(X_i(t),Y_i(t),Z_{1i}(t),Z_{2i}(t),\Theta_i(t)\big)}.
\]

The five coordinates are treated as structured rather than exhaustively scalar state. The split between \(Z_1\) and \(Z_2\) is retained because recovery/recoil after mismatch and successful integration/carryover are different operations. \(\Theta\) carries resonance information including frequency, phase, amplitude, and coherence.

Early project notes described a resonance-like tuple approximately of the form

\[
\eta=(f,A,\phi,\gamma),
\]

and associated harmonious interaction with lower interaction cost. Stage 2 treats that artifact as conceptual ancestry of the modern resonance framework, without retroactively asserting that \(\gamma=Z_1\) or that \(Z_2\) is literal kinetic energy.

Stage 2 also clarifies the energy question. A standalone energy variable is **not** added to the node tuple. The environment is modeled as an open source of perturbational forcing; excitation, transfer, work, dissipation, and carried flow are derived interaction quantities. The first candidate transfer law is

\[
\eta_{ij}=S_\Theta(i,j),\qquad C_{ij}=1-S_\Theta(i,j),
\]

where \(S_\Theta\) is pairwise resonance similarity. These are test equations, not established physical laws.

The first preregistered Stage 2 experiment, **EL-EXP-REEL-001**, uses a 2×2 factorial design to test whether selective environmental exposure has a different persistent effect when transfer is dynamically resonance-dependent than when transfer efficiency is frozen. The primary causal contrast is

\[
\boxed{(A-B)-(C-D)}.
\]

The lean experimental runtime deliberately excludes restored anatomical mechanisms so that the immediate causal surface remains minimal.

---

# 1. Stage Boundary and Status Discipline

Stage 1 is not rewritten by Stage 2. Its results remain evidence about the exact runtimes and protocols that produced them.

Stage 2 adopts three status classes:

- **Adopted architecture:** a current project-level structural decision.
- **Candidate mechanism:** an explicit rule implemented for testing but not established as a general law.
- **Unresolved:** a question reserved for later experiment or deliberate Senate decision.

This distinction exists specifically to prevent a useful candidate equation, visualization, or analogy from being silently promoted into the canonical architecture.

---

# 2. Canonical Stage 2 Node

## 2.1 Adopted state

\[
\boxed{N_i=(X_i,Y_i,Z_{1i},Z_{2i},\Theta_i)}.
\]

No standalone \(E\) coordinate is part of the core node.

### X — Identity / persistent organization

Structured state representing comparatively durable present organization. Scalar displays are telemetry projections, not the complete variable.

### Y — Memory / perception / retained interaction state

Structured state carrying recent and accumulated effects of environmental and relational input.

### Z1 — Recoil / recovery / failed-transfer response

Structured response associated with mismatch, rejected integration, recoil, recovery, or structural restoration.

### Z2 — Integration / transfer / carryover response

Structured response associated with qualified transfer, integration readiness, accepted carryover, or incorporation.

### Theta — Resonance state

Structured resonance state currently operationalized through frequency, phase, amplitude, and coherence. Pairwise similarity is written

\[
S_\Theta(i,j)\in[0,1].
\]

The present first-run implementation uses three-component vectors for \(X,Y,Z_1,Z_2\). That dimensionality is an implementation choice, not a final ontological claim.

---

# 3. Why Z1 and Z2 Remain Separate

For transfer experiments, a single generic \(Z\) is insufficient. Failed interaction and successful integration are not the same event.

\[
\text{mismatch / failure}\rightarrow Z_1\text{ response}
\]

\[
\text{qualified transfer}\rightarrow Z_2\text{ response}.
\]

If \(Z_1\) is absent, the architecture lacks an explicit recovery/recoil path. If \(Z_2\) is absent, the architecture lacks an explicit accepted-transfer/carryover path.

The exact update equations remain candidate-level; the two-channel distinction is the adopted Stage 2 architecture.

---

# 4. Resonance Lineage and Low-Cost Interaction

An early handwritten artifact contains approximately

\[
\eta=(f,A,\phi,\gamma),
\]

with notes associating:

- \(f\): frequency / relatedness;
- \(A\): amplitude / strength / influence;
- \(\phi\): phase / alignment;
- \(\gamma\): damping / resistance to change / stability.

The notes also describe stable self-organization through minimizing interaction cost and characterize harmonious interaction as comparatively low-effort.

The supported continuity is therefore:

\[
\text{greater resonance alignment}
\rightarrow
\text{lower effective mismatch/resistance}
\rightarrow
\text{more efficient transfer}.
\]

Stage 2 does **not** infer from the old notes that \(\gamma\) is identical to modern \(Z_1\), or that \(Z_2\) is literal kinetic energy. Those would be retrospective mappings not established by the source artifact.

---

# 5. Environmental Forcing and Energy Accounting

## 5.1 Open driven system

The high-disorder environment is treated as a source of perturbational forcing. It does not create energy from nothing; in the model it injects normalized excitation into the node system.

Conceptually:

\[
\text{environmental perturbation}
\rightarrow
\text{node excitation}
\rightarrow
\text{interaction}
\rightarrow
\text{transfer / recoil / work / dissipation}.
\]

## 5.2 Energy is not a node coordinate

Stage 2 rejects an arbitrary node “battery” added merely to make transfer possible. Excitation is represented as auxiliary flow/bookkeeping associated with the environment and interactions.

The current discrete accounting rule is

\[
\boxed{E_{available}=E_{dissipated}+E_{work}+E_{carried}}
\]

up to floating-point tolerance.

At cluster scale the conceptual open-system budget is

\[
\frac{dE_{cluster}}{dt}=P_{env}-P_{diss}-P_{work}.
\]

These terms are normalized computational quantities. They are not yet dimensioned in joules, and the project does not claim physical thermodynamic validity from this bookkeeping alone.

## 5.3 Meaning of “costless” transfer

In the idealized resonance limit,

\[
S_\Theta\rightarrow1\Rightarrow C_{mismatch}\rightarrow0.
\]

This means the **mismatch loss** can approach zero. It does not mean no excitation is involved and does not imply free-energy production. For the transferable portion, the intended limiting behavior is simply

\[
E_{out}\approx E_{in}
\]

before work or other losses are removed.

---

# 6. Candidate Resonance-Transfer Law

The first Stage 2 experiment uses the minimum monotonic candidate:

\[
\boxed{\eta_{ij}=S_\Theta(i,j)}
\]

\[
\boxed{C_{ij}=1-S_\Theta(i,j)}.
\]

The law does not create excitation. It determines what fraction of available excitation survives mismatch as transferable output.

The comparison mechanism freezes efficiency at the common Tick-0 mean similarity:

\[
\eta_{ij}=\bar S_\Theta(0).
\]

The functional form is deliberately simple and replaceable. Failure of the linear law is an experimental result, not an architectural failure.

---

# 7. Candidate Local Transfer Sequence

For EL-EXP-REEL-001 the local sequence is:

\[
\text{environmental input}
\rightarrow Y
\rightarrow \Theta\text{ response}
\rightarrow S_\Theta
\rightarrow \eta
\rightarrow
\begin{cases}
Z_2 & \text{transfer/integration response}\\
Z_1 & \text{mismatch/recoil response}
\end{cases}
\rightarrow \Delta X\text{ when work occurs}.
\]

Received transfer may weakly couple destination \(\Theta\) toward source \(\Theta\). This is an explicit local oscillator-style rule. The experimental question is whether the complete local loop produces persistent system-level feedback differentiation, not whether a resonance coupling term exists in code.

No explicit persistent neighbor “preference weight” is programmed.

---

# 8. Post-Stage-1 Commissioning Requirements

Stage 2 carries forward the apparatus lessons established during LAB-COM-001:

- boot `READY / PAUSED` at Tick 0;
- explicit Start;
- Pause and deterministic one-tick Step;
- visible editable seed;
- reproducible full initialization;
- spatial state seeded whenever spatial state is scientifically active;
- no unseeded randomness in initialization or scientific dynamics;
- diagnostic/harness evaluation must not consume simulation RNG;
- canonical reset clears run history;
- observation must not perturb state;
- scientific updates must be independent of display-frame cadence;
- controls should be distinguishable as initialization, dynamics, environmental, observation, or recording controls.

Prior commissioning identified and corrected hidden nondeterminism including unseeded spatial initialization and nondeterministic diagnostic sampling.

EL-EXP-REEL-001 adds a further requirement: **synchronous within-tick updates**. Environmental forcing is applied, a complete pre-interaction snapshot is frozen, every edge is calculated from that snapshot, and accumulated effects are then applied simultaneously. JavaScript node iteration order therefore cannot become an unintended causal variable.

---

# 9. EL-EXP-REEL-001 — First Preregistered Stage 2 Experiment

## 9.1 Motivation

The experiment is inspired by the general feedback form

\[
\text{exposure}
\rightarrow
\text{state change}
\rightarrow
\text{changed later interaction}
\rightarrow
\text{changed later exposure/history}.
\]

It is not an attempt to reconstruct a proprietary Reel recommendation algorithm.

## 9.2 Research question

Does a selective environmental exposure have a different persistent effect when node-to-node transfer efficiency is dynamically resonance-dependent than when transfer efficiency is frozen?

## 9.3 Factorial design

All four arms begin from the exact same seeded Tick-0 node state and receive the same deterministic base environmental forcing.

| Arm | Transfer mechanism | Tick-51 selective pulse |
|---|---|---|
| A | resonance-mediated | yes |
| B | resonance-mediated | no |
| C | frozen efficiency | yes |
| D | frozen efficiency | no |

The pulse is added only to Node 1 in A and C at Tick 51. B and D receive the same base environmental forcing but no additional pulse.

For observable \(M\):

\[
\Delta_R=M_A-M_B,
\qquad
\Delta_F=M_C-M_D,
\]

and the primary causal contrast is

\[
\boxed{I_M=(M_A-M_B)-(M_C-M_D)}.
\]

This difference-in-differences structure was adopted during pre-launch review because a simple two-arm resonance-versus-frozen comparison could diverge before the intervention and therefore confound mechanism drift with pulse effect.

## 9.4 Fixed checkpoints

\[
0,25,50,75,100,150.
\]

The runtime pauses automatically at every post-zero checkpoint. The selective pulse occurs at Tick 51 immediately after the Tick-50 pause is resumed.

## 9.5 Predeclared observables

The runtime exports:

- complete structured node state;
- mean X, Y, Z1, Z2 projections;
- mean pairwise Theta similarity;
- Theta-similarity variance;
- carried excitation;
- environmental input;
- transferred excitation;
- dissipated excitation;
- work;
- pathway concentration;
- excitation-accounting residual;
- pulse count by arm;
- A-B pulse effect;
- C-D pulse effect;
- factorial interaction \((A-B)-(C-D)\).

The interaction is displayed for mean Theta similarity, pathway concentration, retained flow, cumulative dissipation, and cumulative work.

## 9.6 Integrity conditions

Before Tick 51:

\[
A=B,\qquad C=D
\]

must hold exactly for scientific node state, and pulse counts must be `0/0/0/0`.

After Tick 51, pulse counts must be exactly

`1/0/1/0` for A/B/C/D.

Material excitation-accounting error, wrong checkpoint behavior, wrong runtime, altered parameters, or uncontrolled intervention invalidates the run.

## 9.7 Result classes

**Persistent mechanism-specific response:** the factorial interaction appears after Tick 51 and remains directionally persistent through Tick 150 on one or more predeclared organization/flow observables.

**Transient mechanism-specific response:** the interaction appears but contracts substantially toward zero by Tick 150.

**Pulse response without mechanism interaction:** A-B and C-D show effects, but \((A-B)-(C-D)\) remains approximately zero.

**No meaningful pulse response:** both A-B and C-D remain approximately zero.

**Invalid:** any protocol or integrity failure.

No numeric significance threshold is invented before a replication distribution exists. The first Seed-42 run is a preregistered mechanistic probe; replication is required before generalized claims.

---

# 10. Restored-Anatomy V2 Remains Separate

The separate V2 anatomy lineage includes Mati/central core, radials, orbitals/circulation, resonance rings, richer spatial anatomy, and rendered transfer pathways.

Their exclusion from EL-EXP-REEL-001 is experimental minimalism, not a judgment that they are scientifically irrelevant. If a later experiment makes those structures causally active, they must be introduced explicitly and tested as added mechanisms.

Therefore:

> **Stage 2 White Paper is not the Restored-Node-Anatomy V2 Brief.**

They remain separate until a deliberate integration decision.

---

# 11. Gamma / Consequential History

\(\Gamma\) remains a project research concept for consequence, legacy, scarring, and forward influence from prior events. It is deliberately excluded as a causal variable in EL-EXP-REEL-001.

The first Stage 2 experiment asks what the five-coordinate node plus environmental forcing can do without a dedicated long-history reinforcement term. If persistent feedback requires a \(\Gamma\)-like variable, that becomes evidence for a later experiment rather than an assumption embedded in this one.

---

# 12. Claim Discipline

Stage 2 does **not** currently establish that:

- normalized excitation is literal physical energy;
- environmental disorder is thermodynamic entropy;
- the model is physically thermodynamic;
- \(\eta=S_\Theta\) is uniquely correct;
- \(Z_1\) is mechanical inertia;
- \(Z_2\) is kinetic energy;
- resonance constitutes learning;
- persistence constitutes consciousness or intelligence;
- the experiment reproduces a proprietary recommendation system;
- the restored anatomy is decorative or unnecessary.

A positive experiment demonstrates behavior of the stated computational model under the stated rules.

---

# 13. Unresolved Stage 2 Questions

1. Is the linear \(\eta=S_\Theta\) mapping adequate?
2. Does transfer require an activation threshold in addition to mismatch cost?
3. How should recoil, recovery, damping, and repair be separated inside \(Z_1\)?
4. How should acceptance, integration, and carryover be separated inside \(Z_2\)?
5. Under what conditions should work alter \(X\), and should that work be reversible?
6. Should dissipated/incoherent excitation re-enter the environment?
7. What conservation law should govern any future physically dimensioned model?
8. Does \(\Gamma\) explain anything beyond path dependence already carried by the five-coordinate state?
9. Can environmental forcing plus differential transfer efficiency generate resonant clusters without an explicit clustering objective?
10. Do restored anatomical mechanisms change measured dynamics when made causal?
11. How sensitive are results to dimensionality, seed, population size, pulse target, and forcing regime?
12. Can clusters maintain useful excitation circulation while paying work/dissipation costs without pathological collapse or growth?

---

# 14. Stage 2 Research Doctrine

> **Freeze the specimen. Define the intervention. Preregister the checkpoints and controls. Run without theoretical improvisation. Interpret only after the final export.**

Interesting observations are recorded and parked. Architecture is not altered mid-run to make a result more interesting.

The objective is not to make nodes appear intelligent. It is to determine what organization, persistence, recovery, differentiation, and feedback arise from a minimal explicit substrate under controlled perturbation.

---

# 15. Current Implementation Record

Repository:

`leonardodecreative/EmergenceLab`

Stage 2 experiment branch:

`stage2/reel-001`

**Final canonical evidence-generating runtime:**

`stage2/reel-001/EL-EXP-REEL-001_FACTORIAL.html`

Protocol:

`stage2/reel-001/EL-EXP-REEL-001_PROTOCOL.md`

The canonical runtime:

- initializes READY / PAUSED at Tick 0;
- uses deterministic seeded initialization;
- creates four identical Tick-0 arm states;
- generates deterministic base forcing from seed + tick;
- applies the pulse only to A and C at Tick 51;
- uses resonance-mediated and frozen-efficiency factors;
- keeps Mati/radial/orbital anatomy out of dynamics;
- keeps energy outside the node tuple;
- performs normalized transfer/work/dissipation accounting;
- computes all within-tick pair interactions from frozen snapshots;
- pauses automatically at 25, 50, 75, 100, and 150;
- displays integrity checks and factorial contrasts;
- exports complete JSON state and telemetry.

The earlier `index.html` and `EL-EXP-REEL-001.html` files in the experiment directory are retained only as development audit artifacts. They are explicitly superseded and must not be used to generate evidence.

---

# 16. Immediate Scientific Next Step

No further architecture addition is required before the operator review.

The operator should verify the final runtime, Seed 42, Tick-0 arm identity, integrity status, factor labels, and baseline export. Only then should the run proceed through

\[
0\rightarrow25\rightarrow50\rightarrow75\rightarrow100\rightarrow150.
\]

The Tick-51 intervention is automatic. No parameter tuning is permitted during the preregistered run. Post-hoc interpretation begins only after the Tick-150 export is secured.

---

## End — Stage 2 White Paper, Working Revision 2

**Stage 1 remains frozen. Restored-anatomy V2 remains separate. Candidate Stage 2 mechanisms remain subject to experiment.**
