# EMERGENCE LAB — STAGE 2 WHITE PAPER

## Resonant Transfer, Environmental Forcing, Structured State, and Experimental Transition

**Status:** Stage 2 working white paper  
**Date:** 31 August 2026  
**Boundary:** Begins after the close of the Stage 1 circulation paper. Stage 1 remains frozen.  
**Separate lineage:** The restored-anatomy V2 work (Mati, radials, orbitals, resonance rings, and atom-inspired rendering) remains a separate document and implementation track and is not incorporated into this Stage 2 paper.

---

## Abstract

Emergence Lab Stage 2 shifts the project from a scalar/partially structured exploratory simulation lineage toward a deliberately structured, reproducible experimental system. The core node is represented as

\[
N_i(t)=\big(X_i(t),Y_i(t),Z_{1i}(t),Z_{2i}(t),\Theta_i(t)\big),
\]

with each coordinate treated as structured state rather than as a single diagnostic scalar. The split between \(Z_1\) and \(Z_2\) is retained because failed-transfer recovery and successful integration are not the same operation. \(\Theta\) carries resonance information, including frequency, phase, amplitude, and coherence.

Stage 2 also clarifies an older design lineage that predates the mature \(Z_1/Z_2\) vocabulary. Early handwritten work described a resonance tuple approximately of the form

\[
\eta=(f,A,\phi,\gamma),
\]

where frequency/relatedness, amplitude/strength, phase/alignment, and damping/resistance were associated with a system that could self-organize toward lower interaction cost. This is treated as conceptual ancestry of the modern resonance state, not as proof that any old symbol maps one-to-one onto a present variable.

A central Stage 2 hypothesis is that environmental perturbations can provide excitation to an open node system, while resonance similarity modulates the efficiency with which that excitation is transmitted between nodes. Energy is therefore not introduced as an additional identity coordinate or internal battery. Instead, excitation, transfer, dissipation, work, and carried flow are accounted for as derived interaction quantities. A candidate law for the first controlled experiment is

\[
\eta_{ij}=S_\Theta(i,j),
\qquad
C_{ij}=1-S_\Theta(i,j),
\]

where \(S_\Theta\) is pairwise resonance similarity. These equations are explicitly provisional and experimentally replaceable.

The first Stage 2 preregistered test, EL-EXP-REEL-001, asks whether a selective environmental exposure can produce a persistent feedback asymmetry when local transfer efficiency depends on resonance, compared with a paired frozen-efficiency control. The experiment uses a lean runtime that excludes the restored visual anatomy so that the causal surface remains minimal.

---

# 1. Stage Boundary

Stage 1 established a useful experimental lineage but also revealed important limitations: scalar compression, ambiguous interface labels, legacy runtime artifacts, implementation drift, and insufficient separation between conceptual architecture and actually executed mechanisms. Stage 2 does not rewrite Stage 1. Results obtained under Stage 1 remain evidence about the runtime and protocol that generated them.

Stage 2 begins when the laboratory adopts three rules:

1. the experimental state and transfer mechanisms must be explicit enough to inspect;
2. initialization and observation must be reproducible enough to support causal comparisons; and
3. proposed mechanisms must be labeled according to status rather than being silently promoted into canonical architecture.

For that reason, this paper uses three status labels:

- **Adopted architecture:** a project-level structural decision currently required for Stage 2 work;
- **Candidate mechanism:** an explicit rule implemented for testing but not established as a general law;
- **Unresolved:** a question deliberately left open pending experiment or Senate decision.

---

# 2. Canonical Stage 2 Node

## 2.1 Adopted core state

The Stage 2 core node is

\[
\boxed{N_i=(X_i,Y_i,Z_{1i},Z_{2i},\Theta_i)}.
\]

No standalone \(E\) coordinate is part of the core node.

The core coordinates are interpreted as follows.

### X — Identity / persistent organization

\(X\) represents the node's comparatively durable present organization. In Stage 2 it is structured state. A scalar summary may be displayed for telemetry, but that projection is not the full variable.

### Y — Memory / perception / retained interaction state

\(Y\) carries recent and accumulated effects of input and interaction. It is structured state and acts as an important bridge between environmental exposure and later node behavior.

### Z1 — recoil / recovery / failed-transfer response

\(Z_1\) is reserved for the response associated with mismatch, failed integration, recovery, recoil, or structural restoration. It must not be silently collapsed into \(Z_2\).

### Z2 — integration / transfer / carryover response

\(Z_2\) is reserved for qualified transfer, integration readiness, accepted carryover, or successful incorporation. It must not be silently collapsed into \(Z_1\).

### Theta — resonance state

\(\Theta\) represents the node's resonance-bearing state. The current operational representation includes frequency, phase, amplitude, and coherence. Pairwise similarity between two \(\Theta\) states is written

\[
S_\Theta(i,j)\in[0,1].
\]

A scalar `Theta` display value is only a projection of this richer state.

## 2.2 Structured rather than scalar

Stage 2 treats all five core coordinates as capable of internal structure. This is not a claim that one particular dimensionality is final. The important architectural rule is that identity, memory, recoil, transfer, and resonance are not assumed to be exhaustively represented by one number each.

The present EL-EXP-REEL-001 runtime uses three-component vectors for \(X,Y,Z_1,Z_2\), while \(\Theta\) contains structured frequency, phase, amplitude, and coherence. This dimensionality is an experimental implementation choice, not a metaphysical or biological claim.

---

# 3. The Z Split Is Not Optional in Stage 2

Earlier project phases sometimes treated \(Z\) as a generic stability variable. Stage 2 rejects that collapse for experiments involving transfer.

A failed interaction and a successful integration are mechanically different events. If only \(Z_2\) exists, there is no explicit recovery/recoil path after mismatch. If only \(Z_1\) exists, there is no explicit pathway for accepted transfer and carryover.

The Stage 2 distinction is therefore:

\[
\text{mismatch / failure}\longrightarrow Z_1\text{ response},
\]

\[
\text{qualified transfer}\longrightarrow Z_2\text{ response}.
\]

The exact differential equations governing recovery and integration remain candidate-level and may change with evidence. The existence of two distinct response channels is the adopted architectural decision.

---

# 4. Resonance Lineage and the Early Low-Cost Interaction Idea

Handwritten work from the earlier project period describes a resonance-like tuple

\[
\eta=(f,A,\phi,\gamma),
\]

with notes associating:

- \(f\) with frequency or relatedness;
- \(A\) with amplitude, strength, or influence;
- \(\phi\) with phase and alignment;
- \(\gamma\) with damping, resistance to change, or stability.

The same notes describe a system in which nodes can self-organize toward stable states by minimizing interaction cost and characterize harmonious interaction as comparatively low-effort.

Stage 2 recognizes a strong conceptual continuity between this early work and the modern \(\Theta\) variable. However, the historical artifact does **not** establish that \(\gamma=Z_1\), nor that \(Z_2\) is literally kinetic energy. Those mappings would be retrospective overreach.

The supported conceptual bridge is narrower:

\[
\text{better resonance alignment}
\rightarrow
\text{lower effective mismatch/resistance}
\rightarrow
\text{more efficient transfer}.
\]

This bridge becomes a testable Stage 2 hypothesis rather than a retrospective claim about Stage 1.

---

# 5. Environmental Forcing and the Energy Question

## 5.1 Adopted conceptual boundary

Energy is not added to the core tuple as a sixth node coordinate. A node is not assigned an arbitrary internal battery merely to make transfer possible.

The Stage 2 environmental picture is instead an **open driven system**. The environment produces perturbations. Those perturbations provide excitation that can be absorbed, transmitted, used to perform structural work, or rendered less coherent through mismatch/damping.

The conceptual flow is

\[
\text{environmental perturbation}
\rightarrow
\text{node excitation}
\rightarrow
\text{interaction}
\rightarrow
\text{transfer / recoil / work / dissipation}.
\]

## 5.2 Normalized bookkeeping rather than physical joules

Current Stage 2 runtimes use normalized computational units. The terms `energy`, `work`, `dissipation`, and `entropy` are bookkeeping analogies unless and until a physically dimensioned model is separately derived and validated.

This prevents two opposite errors:

1. pretending that a simulation quantity is already real thermodynamic energy; and
2. losing conservation/accounting discipline merely because the system is computational.

## 5.3 Open-system accounting

A conceptual cluster-level budget is

\[
\frac{dE_{cluster}}{dt}
=
P_{env}-P_{diss}-P_{work},
\]

where environmental perturbation supplies forcing, dissipation represents excitation no longer available to coherent transfer, and work represents excitation committed to persistent structural change.

Within a discrete transfer event, the initial Stage 2 runtime enforces the bookkeeping identity

\[
E_{available}
=
E_{dissipated}+E_{work}+E_{carried}
\]

up to floating-point tolerance.

`Carried` excitation becomes transient input available for later node-to-node transfer. This flow is auxiliary interaction state; it does not change the canonical node tuple.

## 5.4 “Costless” transfer

A perfectly aligned interaction may be modeled as approaching zero **mismatch cost**. That does not mean the transfer requires no excitation and does not mean energy is created.

The intended limiting interpretation is

\[
S_\Theta\rightarrow1
\Rightarrow
C_{mismatch}\rightarrow0,
\]

and therefore

\[
E_{out}\approx E_{in}
\]

for the transferable portion before any work term is removed.

This is efficient transmission, not free-energy production.

---

# 6. Candidate Resonance-Transfer Law

For the first Stage 2 controlled test, the experimental arm uses

\[
\boxed{\eta_{ij}=S_\Theta(i,j)}
\]

and

\[
\boxed{C_{ij}=1-S_\Theta(i,j)}.
\]

Here \(\eta_{ij}\) is normalized transfer efficiency and \(C_{ij}\) is normalized mismatch cost.

These are **candidate equations** selected because they implement the minimum monotonic relationship suggested by the project's older harmony/low-cost idea. They deliberately avoid extra free parameters in the first test.

The candidate law does not say that resonance creates excitation. It says that resonance controls what fraction of available excitation survives an interaction as transferable output.

The frozen-efficiency control instead uses

\[
\eta_{ij}=\bar S_\Theta(0),
\]

the Tick-0 mean pairwise resonance similarity, held constant for the entire control trajectory. This creates a paired comparison in which the initial efficiency scale is matched but later changes in resonance cannot alter transfer efficiency.

---

# 7. Local Transfer Sequence for EL-EXP-REEL-001

The first Stage 2 runtime uses the following candidate sequence:

\[
\text{environmental input}
\rightarrow Y
\rightarrow \Theta\text{ response}
\rightarrow S_\Theta
\rightarrow \eta
\rightarrow
\begin{cases}
Z_2 & \text{successful transfer/integration response}\\
Z_1 & \text{mismatch/recoil response}
\end{cases}
\rightarrow \Delta X\text{ when work occurs}.
\]

The system contains no explicit persistent “preference weight” for a neighbor. Any preferential pathway must arise from current node state, resonance similarity, carried excitation, and the local coupling rules.

A small amount of transfer-dependent resonance coupling is permitted: received transfer can move the destination's \(\Theta\) toward the source's \(\Theta\). This is a local oscillator-style coupling rule. The experimental question is not whether that local rule exists; it is whether the closed sequence produces persistent system-level feedback differentiation relative to the control.

---

# 8. Commissioning and Reproducibility Requirements Added After Stage 1

Stage 2 laboratory work adopts the commissioning lessons established during LAB-COM-001.

The experimental apparatus should:

- boot READY / PAUSED at Tick 0;
- require an explicit Start action;
- support Pause and deterministic single-Step;
- use a visible editable seed;
- rebuild the complete initial condition reproducibly from that seed;
- include spatial state in the seeded initialization when spatial state is scientifically active;
- eliminate unseeded random calls from initialization and scientific dynamics;
- prevent diagnostic/test-harness randomness from perturbing the simulation RNG;
- clear run histories at a canonical reset boundary;
- keep simulation updates independent of display frame cadence;
- ensure observation does not alter state;
- distinguish initialization controls, dynamics controls, environmental controls, observation controls, and recording controls.

Earlier commissioning work identified and corrected hidden sources of non-reproducibility, including unseeded spatial initialization and nondeterministic diagnostic sampling. These lessons become Stage 2 requirements regardless of which visual interface is used.

EL-EXP-REEL-001 adds one additional requirement: **within-tick synchronous updates.** Every pairwise interaction for a tick is calculated from the same frozen pre-interaction state. No node is permitted to benefit or suffer merely because its index was visited earlier in a JavaScript loop.

---

# 9. EL-EXP-REEL-001 — First Stage 2 Preregistered Experiment

## 9.1 Motivation

The experiment is inspired by the general structure of a recommendation-feedback process:

\[
\text{exposure}
\rightarrow
\text{response/state change}
\rightarrow
\text{changed future interaction}
\rightarrow
\text{changed later exposure}.
\]

It does not attempt to reconstruct or claim knowledge of a proprietary Reel recommendation algorithm.

## 9.2 Research question

Can a selective environmental exposure create a persistent feedback asymmetry when transfer efficiency is dynamically resonance-dependent, relative to a paired system whose transfer efficiency is frozen at its initial mean value?

## 9.3 Paired design

Both arms begin from an identical seeded node state and receive exactly the same deterministic environmental forcing at every tick.

**Arm A — resonance-mediated:**

\[
\eta_{ij}(t)=S_\Theta(i,j,t).
\]

**Arm B — frozen-efficiency control:**

\[
\eta_{ij}(t)=\bar S_\Theta(0).
\]

Both arms receive the same predeclared selective exposure at Tick 51.

## 9.4 Fixed checkpoints

\[
0,25,50,75,100,150.
\]

The runtime automatically pauses at every post-zero checkpoint.

## 9.5 Observables

The preregistered runtime records:

- structured serialized node state;
- mean X, Y, Z1, Z2 projections;
- pairwise Theta similarity and its variance;
- carried excitation;
- environmental input;
- transferred excitation;
- dissipated excitation;
- work;
- pathway concentration;
- excitation-accounting residual;
- paired arm differences.

## 9.6 Result classes

A persistent post-pulse arm difference through Tick 150 supports the narrow claim that the tested resonance-dependent local coupling can produce persistent feedback differentiation under these rules.

A transient difference supports perturbation sensitivity but not persistent reinforcement.

Little or no arm difference fails to support persistent reinforcement under the selected parameters.

A protocol violation, wrong runtime, incorrect checkpoint, duplicated pulse, nonidentical Tick-0 state, or material bookkeeping error invalidates the run as evidence.

---

# 10. Explicit Exclusion of Restored-Anatomy V2 From This Test

Stage 2 experimental minimalism must not be confused with rejection of the project's restored anatomical vision.

The separate V2 anatomy lineage includes concepts such as:

- Mati / central core;
- radials and axes as rendered anatomy;
- orbital/circulatory movement;
- resonance rings;
- richer three-dimensional spatial expression;
- visual transfer pathways.

Those features may later become scientifically causal. EL-EXP-REEL-001 excludes them because the immediate question can be asked with a smaller causal surface. If a later experiment tests anatomical mechanisms, they must be introduced explicitly as independent structures rather than silently inherited by this runtime.

Therefore:

**Stage 2 white paper ≠ restored-anatomy V2 brief.**

The documents address different project layers and remain separate until a later deliberate integration decision.

---

# 11. Gamma and Consequential History

The project has also developed the concept of \(\Gamma\) as consequentiality, legacy, scarring, or forward influence from prior events.

Stage 2 preserves \(\Gamma\) as a relevant research concept but does **not** make it causal in EL-EXP-REEL-001. The first resonance-transfer experiment should determine what the five-coordinate node plus environmental forcing can do without adding a dedicated long-history reinforcement variable.

This is an intentional control on architectural complexity. If persistent feedback cannot survive without a \(\Gamma\)-like term, that itself becomes useful evidence for a later experiment.

---

# 12. What Stage 2 Does Not Yet Claim

Stage 2 does not establish that:

- the model is physically thermodynamic;
- its normalized excitation is literal energy;
- its environmental disorder parameter is thermodynamic entropy;
- the selected transfer law is uniquely correct;
- \(Z_1\) is identical to mechanical inertia;
- \(Z_2\) is identical to kinetic energy;
- resonance alone produces learning;
- observed persistence constitutes consciousness or intelligence;
- the model reproduces any proprietary recommendation algorithm;
- restored-anatomy structures are merely decorative or scientifically unnecessary.

These boundaries are not rhetorical modesty. They preserve falsifiability and keep the project from confusing a useful analogy with a demonstrated equivalence.

---

# 13. Unresolved Stage 2 Questions

The following remain open:

1. What functional form should replace or refine \(\eta=S_\Theta\) if the linear mapping is inadequate?
2. Should transfer cost be modeled solely as mismatch loss, or should there be an additional activation threshold?
3. What is the best operational distinction between recoil, recovery, damping, and structural repair inside \(Z_1\)?
4. What is the best operational distinction between transfer acceptance, integration, and carryover inside \(Z_2\)?
5. Under what conditions should work alter \(X\), and should that work be reversible?
6. How should incoherent/dissipated computational excitation re-enter the environment, if at all?
7. What conservation law, if any, should be imposed on a later physically dimensioned model?
8. Does \(\Gamma\) add explanatory power beyond path dependence already present in \(X,Y,Z_1,Z_2,\Theta\)?
9. Can the high-disorder driven system self-organize into resonant clusters without an explicit clustering objective?
10. Does the restored anatomy change measurable dynamics once introduced causally, or does it remain representational?
11. How sensitive are Stage 2 outcomes to vector dimensionality, seed, population size, and intervention target?
12. Can the system sustain useful circulation of excitation while still paying work/dissipation costs without pathological numerical collapse or growth?

---

# 14. Stage 2 Research Doctrine

Stage 2 adopts the following laboratory rule:

> Freeze the specimen, define the intervention, preregister the checkpoints, run the control, and interpret only after the run.

New architecture is not to be introduced mid-experiment because an observation is interesting. Interesting observations are recorded and parked for later deliberation.

The Stage 2 objective is not to make the node look intelligent. It is to determine what organization, persistence, recovery, differentiation, and feedback can arise from a minimal explicit substrate under controlled perturbation.

---

# 15. Current Stage 2 Implementation Record

A dedicated branch has been created:

`stage2/reel-001`

inside:

`leonardodecreative/EmergenceLab`

The canonical experiment runtime is:

`stage2/reel-001/EL-EXP-REEL-001.html`

The runtime:

- starts READY / PAUSED at Tick 0;
- uses deterministic seeded initialization;
- runs two paired arms from identical Tick-0 state;
- derives each tick's environmental forcing from seed + tick;
- uses structured X, Y, Z1, Z2 and Theta state;
- contains no Mati/radial/orbital dynamics;
- treats excitation as auxiliary flow rather than a node coordinate;
- records environmental input, transfer, dissipation, work and carry;
- uses fixed integer-tick state transitions;
- calculates pair interactions from a frozen pre-interaction snapshot;
- pauses automatically at preregistered checkpoints;
- automatically applies the selective exposure at Tick 51;
- exports complete JSON snapshots and telemetry.

The first `index.html` written in the Stage 2 experiment directory is explicitly retained as a development draft. It is not the preregistered runtime. The canonical runtime is named explicitly above to prevent accidental execution of the draft.

---

# 16. Immediate Next Step

The next scientific action is **not** another architecture addition.

The operator should review the preregistered procedure, verify the canonical branch and runtime, inspect Tick-0 paired identity, save the baseline export, and only then launch Seed 42 through the fixed sequence:

\[
0\rightarrow25\rightarrow50\rightarrow75\rightarrow100\rightarrow150.
\]

The Tick-51 exposure is automated. No parameter tuning is permitted during the run. Post-hoc analysis begins only after the Tick-150 export is secured.

---

## End of Stage 2 White Paper — Working Revision 1

Stage 1 remains frozen. Restored-anatomy V2 remains separate. Candidate Stage 2 mechanisms remain subject to experiment.
