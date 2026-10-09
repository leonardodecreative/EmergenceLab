# Emergence Lab — Stage 2 / EL-EXP-REEL-001

## Scientific boundary

Stage 1 is frozen. The restored-anatomy V2 lineage remains separate. No Mati core, radials, orbitals, anatomical resonance rings, or restored-anatomy mechanisms participate in this experiment.

The experimental node is:

\[
N_i=(X_i,Y_i,Z_{1i},Z_{2i},\Theta_i)
\]

Energy is not a sixth node coordinate. Environmental excitation, transfer, dissipation, work, and carried excitation are normalized computational flow telemetry, not physical joules.

## Candidate mechanism

Resonance-mediated transfer uses:

\[
\eta_{ij}=S_\Theta(i,j),\qquad C_{ij}=1-S_\Theta(i,j).
\]

The frozen-efficiency factor holds \(\eta\) at the Tick-0 mean pairwise Theta similarity. This law is a candidate Stage 2 mechanism, not a physical law.

## Final design

EL-EXP-REEL-001 is a 2×2 factorial experiment:

| Arm | Transfer mechanism | Selective Tick-51 pulse |
|---|---|---|
| A | resonance-mediated | yes |
| B | resonance-mediated | no |
| C | frozen efficiency | yes |
| D | frozen efficiency | no |

The primary causal contrast is:

\[
(A-B)-(C-D).
\]

This separates the effect of the selective exposure from baseline divergence caused by using two different transfer mechanisms.

All four arms share the same seeded Tick-0 node state and the same deterministic base environmental forcing. A and C receive the additional Tick-51 Node-1 pulse; B and D do not.

The runtime uses synchronous fixed-tick updates: local environmental forcing is applied, the complete pre-interaction state is frozen, all edges are calculated from that snapshot, and accumulated effects are applied simultaneously.

## Canonical runtime — use this file only

`EL-EXP-REEL-001_FACTORIAL.html`

The following files are superseded development artifacts and must not be used as evidence-generating runtimes:

- `index.html`
- `EL-EXP-REEL-001.html`

## Run

```bash
python3 -m http.server 8000
```

Open:

`http://localhost:8000/EL-EXP-REEL-001_FACTORIAL.html`

The runtime initializes `READY / PAUSED` at Tick 0 and automatically pauses at 25, 50, 75, 100, and 150. Review `EL-EXP-REEL-001_PROTOCOL.md` before pressing Start.
