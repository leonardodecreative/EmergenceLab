# EL-EXP-INDEPENDENCE-001 — Preregistered Protocol

## Kindergarten question

**If I put three different toys in the room and never tell the node which toy is better, does the node develop its own history with one of them?**

## Scientific question

Given three simultaneously available environmental catalysts with equal offered excitation and no reward or prediction mechanism, does a single structured Emergence Lab node develop a persistent, reproducible interaction path through state-dependent compatibility and its own state history?

This experiment tests **node path formation / independence**, not reward learning, prediction, consciousness, free will, or physical thermodynamics.

## Architecture

`N=(X,Y,Z1,Z2,Theta)`

- `X`: comparatively persistent identity/organization state.
- `Y`: retained interaction/memory-perception state.
- `Z1`: recoil/recovery/mismatch response.
- `Z2`: qualified transfer/integration response; kinetic-like carrier lineage remains architectural context.
- `Theta`: structured relational compatibility state.

One node is used per arm so node-to-node social reinforcement cannot explain a path.

## Environment

The environment presents three catalysts at every tick. They are coordinate permutations of the same component values and therefore have equal total structure and equal offered excitation.

- Catalyst A pattern: `[0.90, 0.20, 0.50]`
- Catalyst B pattern: `[0.50, 0.90, 0.20]`
- Catalyst C pattern: `[0.20, 0.50, 0.90]`

Their Theta signatures are likewise cyclic coordinate permutations. No catalyst is labeled good, bad, rewarding, punishing, predictive, safe, dangerous, desirable, or undesirable.

Each catalyst offers `0.18` normalized excitation per tick. All three are simultaneously available in all arms.

Deterministic entropy/noise remains as a background perturbation and is derived only from `seed + tick`, identically across arms.

## Arms

### Arm A — live compatibility

Catalyst uptake shares are recalculated each tick from the node's **current** Theta compatibility with the three catalysts.

### Arm B — frozen compatibility

Catalyst uptake shares are based on the node's Tick-0 Theta compatibility and remain frozen for the entire run. This preserves any initial compatibility bias while removing recursive state-dependent feedback.

### Arm C — equal uptake

Each catalyst receives exactly `1/3` of uptake every tick. This is the symmetry/null control.

## What is deliberately absent

- no reward variable;
- no positive/negative reinforcement signal;
- no dopamine-like mechanism;
- no prediction state;
- no prediction error;
- no goal or utility variable;
- no explicit persistent neighbor/catalyst preference weight;
- no winner-take-all choice rule;
- no hand-authored catalyst ranking.

## Fixed parameters

| Parameter | Value |
|---|---:|
| dimensions | 3 |
| disorder | 0.75 |
| perturbation | 0.18 |
| catalyst energy, each | 0.18 |
| envLearning | 0.055 |
| thetaLearning | 0.045 |
| z1Gain | 0.045 |
| z1Recovery | 0.018 |
| z2Gain | 0.055 |
| xWorkGain | 0.035 |
| workFraction | 0.10 |
| compatibilityFloor | 0.05 |
| compatibilityPower | 2.0 |

## Checkpoints and stopping rule

Locked checkpoints:

`0, 50, 100, 150, 200, 250, 300`

The runtime auto-pauses at every nonzero checkpoint. The primary horizon is Tick 300. No parameter tuning, catalyst editing, or additional intervention is permitted after Tick 0.

## Primary observables

For each arm:

- cumulative catalyst uptake shares;
- last-tick catalyst uptake shares;
- path concentration (HHI = sum of squared uptake shares);
- normalized path entropy;
- late dominant-catalyst persistence over the most recent 50 ticks;
- current Theta compatibility with each catalyst;
- X, Y, Z1, Z2, and full Theta state;
- per-catalyst cumulative offered excitation, uptake, dissipation, and work;
- accounting residual.

## Primary contrasts

At each post-baseline checkpoint:

- `Live - Frozen` path concentration;
- `Live - Equal` path concentration;
- `Live - Frozen` late persistence;
- `Live - Equal` late persistence.

The primary inferential question is whether live compatibility produces **additional path concentration/persistence beyond initial compatibility bias**.

## Preregistered outcome classes

### SUPPORTS STATE-DEPENDENT PATH FORMATION

At least two consecutive late checkpoints among 200, 250, and 300 satisfy both:

1. live path concentration exceeds frozen path concentration by at least `0.02`; and
2. live late-persistence exceeds frozen late-persistence by at least `0.10`.

The live dominant catalyst must also remain the same across those qualifying checkpoints.

This supports only the narrow claim that recursive live state/compatibility creates a persistent path beyond frozen initial bias in that seed.

### INITIAL-BIAS AMPLIFICATION ONLY

A path forms in both live and frozen arms with little live-minus-frozen difference. This indicates that the trajectory is largely explained by Tick-0 compatibility rather than recursive self-history.

### SYMMETRIC / NO PATH

Live, frozen, and equal arms remain near equal uptake, or live does not meet the concentration/persistence thresholds.

### UNSTABLE / SWITCHING PATH

Live becomes concentrated but repeatedly changes dominant catalyst through the late window. This supports state sensitivity but not persistent path formation.

### INVALID

Any of the following invalidates the run:

- Tick-0 X/Y/Theta mismatch across arms;
- parameter mutation after reset;
- missing or duplicate checkpoint sequence;
- non-finite values;
- catalyst shares outside `[0,1]`;
- cumulative accounting residual > `1e-9`;
- reward or prediction mechanism introduced during the run;
- catalyst offered energy differs among A/B/C within a tick.

## Seed series

Version B should begin with five predetermined seeds:

`5, 18, 103, 449, 871`

These intentionally reuse the REEL-001 replication seed set for continuity while testing a different mechanism. Do not substitute seeds post hoc because a result looks uninteresting.

## Replication standard

Bobby performs Version B first. Codex independently performs Version C from the committed runtime/protocol. If B and C materially disagree, Version A adjudicates. Every evidence-generating run must record repository, branch, commit SHA, runtime SHA-256, browser/runtime environment, seed, parameters, checkpoint exports, and result classification.

## Claim boundary

A positive result would not mean the node has free will, desire, reward, preference in a psychological sense, or consciousness. It would mean that under neutral alternatives the node's own changing state can causally bias its later interaction trajectory beyond a frozen initial-compatibility control.
