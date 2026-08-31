# Emergence Lab — Stage 2 / EL-EXP-REEL-001

This directory contains the lean Stage 2 experimental runtime for the resonance-mediated transfer experiment informally motivated by the "Explain Reel Algorithm" discussion.

## Boundary

This runtime intentionally excludes the restored-anatomy V2 layer: no Mati core, radials, orbitals, anatomical resonance rings, or other visual-anatomy mechanisms participate in the dynamics. Those remain a separate research/design lineage.

Stage 1 evidence is frozen and is not retroactively reinterpreted through this runtime.

## Core state

The experimental node state is:

\[
N_i=(X_i,Y_i,Z_{1i},Z_{2i},\Theta_i)
\]

where `Theta` contains frequency, phase, amplitude, and coherence. Energy is **not** a sixth node coordinate. The runtime instead records normalized environmental excitation, transmitted excitation, dissipation, and work as derived interaction telemetry.

## Candidate Stage 2 mechanism under test

Environmental perturbations provide normalized excitation to the system. Pairwise transfer efficiency is modulated by Theta similarity in the experimental arm:

\[
\eta_{ij}=S_\Theta(i,j)
\]

and mismatch cost is therefore:

\[
C_{ij}=1-S_\Theta(i,j).
\]

This is a replaceable candidate mechanism, not a claimed physical law.

The matched control arm replaces resonance-dependent efficiency with a constant efficiency while keeping the same seeded environment schedule and initial node state.

## Run

Serve this directory with any static HTTP server. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

The simulation begins `READY / PAUSED` at Tick 0. Do not press Start until the protocol has been reviewed.
