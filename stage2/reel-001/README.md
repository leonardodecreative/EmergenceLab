# Emergence Lab — Stage 2 / EL-EXP-REEL-001

This directory contains the lean Stage 2 experimental runtime for the resonance-mediated transfer experiment informally motivated by the "Explain Reel Algorithm" discussion.

## Scientific boundary

Stage 1 evidence is frozen and is not retroactively reinterpreted through this runtime.

The restored-anatomy V2 lineage also remains separate. **No Mati core, radials, orbitals, anatomical resonance rings, or other restored-anatomy mechanisms participate in EL-EXP-REEL-001.**

## Core state

The experimental node state is:

\[
N_i=(X_i,Y_i,Z_{1i},Z_{2i},\Theta_i)
\]

All five coordinates are represented as structured state. `Theta` carries frequency, phase, amplitude, and coherence.

Energy is **not** a sixth node coordinate. The runtime instead tracks normalized environmental excitation, transmitted excitation, dissipation, work, and carried excitation as derived flow telemetry. These are computational bookkeeping units, not physical joules.

## Candidate Stage 2 mechanism under test

Environmental perturbations provide forcing. Pairwise transfer efficiency in the experimental arm is:

\[
\eta_{ij}=S_\Theta(i,j)
\]

with mismatch cost:

\[
C_{ij}=1-S_\Theta(i,j).
\]

This is a replaceable **candidate mechanism**, not a claimed physical law.

The paired control arm freezes transfer efficiency at the Tick-0 mean pairwise Theta similarity while preserving the same seed, initial nodes, environmental forcing schedule, and selective exposure pulse.

The canonical runtime uses synchronous fixed-tick updates: environmental forcing is applied, the complete pre-interaction state is frozen, all pairwise edge effects are computed from that snapshot, and accumulated state effects are applied simultaneously. This prevents node iteration order from becoming a hidden causal variable.

## Canonical runtime

Use:

`EL-EXP-REEL-001.html`

The earlier `index.html` in this directory is a development draft and is **not** the preregistered runtime.

Serve this directory with a static HTTP server:

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000/EL-EXP-REEL-001.html`

The simulation initializes `READY / PAUSED` at Tick 0 and automatically pauses at the preregistered checkpoints. Do not press Start until `EL-EXP-REEL-001_PROTOCOL.md` has been reviewed.
