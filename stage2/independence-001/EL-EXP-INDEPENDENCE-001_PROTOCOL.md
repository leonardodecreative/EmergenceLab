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
Catalyst uptake shares are based on the node's Tick-0 Theta compatibility and remain frozen for the entire run.

### Arm C — equal uptake
Each catalyst receives exactly `1/3` of uptake every tick.

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

The runtime auto-pauses at every nonzero checkpoint. The primary horizon is Tick 300.

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

### INITIAL-BIAS AMPLIFICATION ONLY

A path forms in both live and frozen arms with little live-minus-frozen difference.

### SYMMETRIC / NO PATH

Live, frozen, and equal arms remain near equal uptake, or live does not meet the concentration/persistence thresholds.

### UNSTABLE / SWITCHING PATH

Live becomes concentrated but repeatedly changes dominant catalyst through the late window.

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

## Seed registry and cohort separation

### Primary fresh cohort — 25 preregistered initial conditions

These twenty-five seeds are the primary confirmatory sample:

`3419007238, 287180030, 4143716330, 1896701048, 2810229999, 2929521851, 3131026862, 4090322451, 1332876187, 3913458319, 628113401, 3104787148, 1387739890, 4260353071, 542689041, 3430374222, 551830518, 1895479095, 1068218150, 3122905691, 3703931321, 4226070310, 1319341081, 2887722089, 4118125398`

Selection rule: for index `i = 1..25`, compute SHA-256 over the UTF-8 string `EL-EXP-INDEPENDENCE-001:FRESH:i`; interpret the first four digest bytes as a big-endian unsigned 32-bit integer. Any collision with a previously declared historical seed or duplicate would be skipped and the next index used. No such collision occurred here.

These seeds are treated as fresh relative to the recorded Emergence Lab evidence history at preregistration. No seed may be substituted after results are observed.

### Historical continuity panel — 5 preregistered initial conditions

`5, 18, 103, 449, 871`

These seeds were already used in REEL-001. They are intentionally preserved as a longitudinal cross-experiment panel and must be reported separately from the 25 fresh seeds. They may reveal cross-experiment regularities, but they are not to be represented as fresh independent initial conditions.

Version B runs the 25 fresh seeds first, in the declared order, followed by the five continuity seeds in the declared order.

Cross-seed reporting must include separate summaries for the 25-seed fresh cohort and the five-seed continuity panel, plus a clearly labeled all-30 descriptive summary if useful. Report valid/invalid ledger, per-seed outcome class, sign consistency for primary contrasts, mean, sample standard deviation, median, range, and the count/proportion meeting the preregistered support class. Negative, null, switching, and invalid runs remain in the record.

## Replication standard

Bobby performs Version B first. Codex independently performs Version C from the committed runtime/protocol. If B and C materially disagree, Version A adjudicates. Every evidence-generating run must record repository, branch, commit SHA, runtime SHA-256, browser/runtime environment, seed, parameters, checkpoint exports, and result classification.

## Claim boundary

A positive result would not mean the node has free will, desire, reward, preference in a psychological sense, or consciousness. It would mean that under neutral alternatives the node's own changing state can causally bias its later interaction trajectory beyond a frozen initial-compatibility control.
