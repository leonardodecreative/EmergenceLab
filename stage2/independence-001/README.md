# Emergence Lab — EL-EXP-INDEPENDENCE-001

## Status

**PREREGISTERED / NOT YET RUN**

This folder is the evidence-generating package for the Stage 2 node-independence / neutral-catalyst path-formation experiment.

## Kindergarten question

> If I put three different toys in the room and never tell the node which toy is better, does the node develop its own history with one of them?

## Scientific boundary

This test asks whether a single structured node can develop a persistent interaction path among three neutral, equally available environmental catalysts through its own changing state and Theta compatibility.

It does **not** test reward, dopamine-like reinforcement, prediction, free will, consciousness, or physical thermodynamics.

## Runtime

Use only:

`EL-EXP-INDEPENDENCE-001.html`

Read before running:

`EL-EXP-INDEPENDENCE-001_PROTOCOL.md`

## Design

| Arm | Uptake rule | Purpose |
|---|---|---|
| A | live current-Theta compatibility | test recursive path formation |
| B | Tick-0 compatibility frozen | control for initial compatibility bias |
| C | equal 1/3 uptake | symmetry/null control |

All arms start from the same seeded node state. All three catalysts are present simultaneously at every tick with the same offered excitation.

## Seed registry — 30 total

### Primary fresh cohort — 25 seeds

These are the primary confirmatory initial conditions. They were generated deterministically before observation from SHA-256 of `EL-EXP-INDEPENDENCE-001:FRESH:<index>` for indices 1 through 25, using the first four digest bytes as an unsigned 32-bit integer.

`3419007238, 287180030, 4143716330, 1896701048, 2810229999, 2929521851, 3131026862, 4090322451, 1332876187, 3913458319, 628113401, 3104787148, 1387739890, 4260353071, 542689041, 3430374222, 551830518, 1895479095, 1068218150, 3122905691, 3703931321, 4226070310, 1319341081, 2887722089, 4118125398`

### Historical continuity panel — 5 seeds

`5, 18, 103, 449, 871`

These five are retained because they were used in REEL-001. They are analyzed as a longitudinal cross-experiment panel and are **not** counted as fresh independent initial conditions.

## Locked checkpoints

`0, 50, 100, 150, 200, 250, 300`

## Fixed parameters

- dim = 3
- disorder = 0.75
- perturbation = 0.18
- catalyst energy each = 0.18
- envLearning = 0.055
- thetaLearning = 0.045
- z1Gain = 0.045
- z1Recovery = 0.018
- z2Gain = 0.055
- xWorkGain = 0.035
- workFraction = 0.10
- compatibilityFloor = 0.05
- compatibilityPower = 2.0

## Primary metrics

- catalyst uptake shares
- path concentration (HHI)
- normalized path entropy
- late dominant-catalyst persistence
- live-minus-frozen path concentration
- live-minus-frozen late persistence
- full X/Y/Z1/Z2/Theta trajectories
- catalyst compatibility trajectories
- accounting residual

## Reproduction

From the repository root:

```bash
git fetch origin
git switch stage2/independence-001
git pull origin stage2/independence-001
python3 -m http.server 8000
```

Then open:

`http://localhost:8000/stage2/independence-001/EL-EXP-INDEPENDENCE-001.html`

## Operator procedure

1. Confirm the page says `READY / PAUSED` at Tick 0.
2. Run the 25 fresh seeds in their declared order, then the five continuity seeds in their declared order.
3. Enter the current seed and press `Reset 3-arm run`.
4. Confirm `INTEGRITY PASS` and Tick 0.
5. Export Tick 0 JSON.
6. Press `Start`.
7. At each auto-pause — 50, 100, 150, 200, 250, 300 — export JSON before pressing Start again.
8. After the Tick-300 export, advance to the next declared seed and repeat.
9. Preserve all 210 JSON exports as the Version B evidence series.
10. Only after the complete B series is secured should Codex perform Version C independently.

## Results record

This section is intentionally frozen as **PENDING** until the declared B/C procedure is completed.

- Version B: PENDING
- Version C: PENDING
- Version A adjudication: NOT DETERMINED
- Fresh-cohort result: PENDING
- Continuity-panel result: PENDING
- Claim status: NO RESULT YET

When the experiment closes, this README must be updated with the exact commit/runtime hashes, valid/invalid seed ledger, per-seed outcome class, cross-seed summary, and strongest defensible claim. Negative/null findings must remain in the record.

## Reproducibility rule

A finding that cannot be reproduced from the committed runtime, protocol, parameters, seed, and exported evidence is not an Emergence Lab finding.
