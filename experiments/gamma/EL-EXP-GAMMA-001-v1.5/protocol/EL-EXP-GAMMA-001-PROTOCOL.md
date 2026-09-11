# EL-EXP-GAMMA-001 — Prospective Consequential-History Qualification

Status: preregistered candidate protocol  
Gamma status: inert, noncanonical, fully ablatable  
Canonical `emergenceLabVSSim-z1-z2.html`: untouched  
Controlled field: purpose-built headless Gamma bench using the adopted node anatomy `N = (X, Y, Z1, Z2, Theta)`

## What this experiment can decide

This experiment asks whether one concrete, non-scalar Gamma realization can predict the signed downstream consequences of a present node-to-node event better than simpler alternatives.

Passing means only:

> Advance this realization to a separately preregistered causal-integration experiment in the canonical engine.

Failing means only:

> Do not advance this tested combination of measurement, representation, retrieval law, placement, parameters, and protocol.

A failure does not eliminate Gamma, non-scalar consequential history, or any broader architecture class.

## Objects under test

For target node `i`, Gamma is a bounded archive:

\[
\Gamma_i(t)=\{(s_k,c_k,\tau_k,H_k,q_k,a_k)\}_{k=1}^{K}
\]

where:

- `s`: event signature;
- `c`: signed consequence vector;
- `tau`: settlement tick;
- `H`: consequence horizon;
- `q`: confidence;
- `a`: actor identity;
- `K`: deterministic archive capacity.

Gamma does not mutate `X`, `Y`, `Z1`, `Z2`, or `Theta` in this experiment.

### Event signature

The primary signature has 49 channels:

| Family | Channels | Purpose |
| --- | ---: | --- |
| Target state | 17 | `X`, `Y`, `Z1`, `Z2`, and structured `Theta` |
| Target relational/environment context | 6 | Five aggregate neighbor measures plus environment |
| Actor state | 17 | The source node's full state at event time |
| Dyad | 2 | Actor-target distance and Theta similarity |
| Event | 7 | Six-way event class plus strength |

This preserves A→B separately from C→B and does not use `X` or a Quanta nucleus as an interaction ledger.

### Consequence vector

The consequence is a signed 23-channel vector over the target's later state and relational/environment context:

\[
c_t(H)=C(S^{e}_{t+H})-C(S^{\neg e}_{t+H})
\]

Both branches begin from the exact same cloned pre-event world. The factual branch receives the event; the counterfactual branch suppresses only that event. No Gamma prediction enters either branch.

## Controlled field

- Six nodes in a one-dimensional circular spatial field.
- Synchronous node updates.
- Deterministic initialization and keyed environmental perturbation.
- Thirty warmup ticks.
- Six balanced intervention classes: support memory, erode memory, align Theta, disrupt phase, integration pulse, recovery shock.
- Intervention response depends on actor state, target state, dyadic alignment, saturation, and available recovery/integration capacity; it never depends on Gamma.
- Every complete event block contains all 30 directed actor-target pairs crossed with all six event classes.
- Three preregistered strength levels: 0.12, 0.20, 0.28.
- Factual trajectory becomes the continuing world after every event; the suppressed branch is used only for consequence measurement.

This is an isolated qualification bench, not a claim that the controlled field is the canonical simulator. Its job is to test Gamma's measurement and retrieval machinery before that machinery is allowed to affect the real engine.

## Acquisition and prospective test

1. Warm up the field.
2. Run 360 acquisition events. Measure each consequence, then record it.
3. Run 180 test events.
4. For each test event, generate every model prediction before measuring or recording the current consequence.
5. Measure the event through the matched factual/counterfactual branches.
6. Score the predictions.
7. Record the newly settled consequence only after scoring.

This permits sequential learning but prevents the current event's answer from leaking into its own prediction.

## Candidate and controls

| Model | Role |
| --- | --- |
| `gammaRelational` | Primary: event-type baseline plus full-signature retrieval of the contextual residual across stored interactions |
| `gammaDyadic` | Secondary: actor-plus-event baseline plus full-signature residual retrieval restricted to the same actor-target history |
| `zero` | Predicts no consequence |
| `recency` | Mean of the last eight target-archive consequences |
| `typeMean` | Mean consequence for the event class |
| `pairTypeMean` | Mean consequence for actor plus event class; prevents actor identity alone from winning |
| `stateKernel` | Target-state/context similarity without actor, dyad, or event descriptor |
| `shuffledGammaRelational` | Same event-type baseline and relational kernel weights with residual records rotated across the target archive |
| `shuffledGammaDyadic` | Secondary within-pair broken-history diagnostic |

Kernel retrieval uses family-balanced RMS distance and a Gaussian kernel. The primary Gamma contribution is the retrieved contextual residual beyond the event-type mean; actor state and dyadic relation remain inside the signature, so A→B and C→B are stored separately while the model may generalize when their relational contexts are similar. Gamma must add information that the categorical prior does not already contain. Sigma, capacity, and horizon are provisional parameters frozen before the official run.

## Primary metric and decision rule

Primary error: family-balanced root-mean-square error over the signed consequence vector.

The candidate advances only if all conditions hold:

1. Commissioning tests pass.
2. Mean measured consequence magnitude exceeds `0.0001`.
3. `gammaRelational` improves pooled balanced RMSE by at least 5% over the best ordinary control.
4. `gammaRelational` improves pooled balanced RMSE by at least 10% over `shuffledGammaRelational`.
5. Conditions 3 and 4 both hold independently in at least four of five official seeds.

Cosine similarity and sign agreement are secondary diagnostics and cannot rescue a failed primary decision.

## Frozen official configuration

| Parameter | Value |
| --- | ---: |
| Nodes | 6 |
| Warmup ticks | 30 |
| Consequence horizon | 10 |
| Acquisition events | 360 |
| Test events | 180 |
| Archive capacity per target | 48 |
| Kernel sigma | 0.015 |
| Recency window | 8 |
| Official seeds | 5, 18, 103, 449, 871 |
| Excluded commissioning seed | 13579 |

Changing an official value makes the result exploratory and noncanonical.

## Version order

1. Bobby runs Version B once and saves the JSON.
2. Codex runs Version C independently from the same package and frozen seeds.
3. Compare build ID, config hash, scientific fingerprint, SHA-256, seed metrics, and verdict.
4. Version A is used only if B and C disagree.

Do not run Version C before Version B has been saved. Do not tune any parameter after seeing an official result.

## Invalidity conditions

The run is invalid if commissioning fails, the event instrument produces negligible consequences, the configuration differs from the frozen official configuration while marked canonical, any official seed is missing, or the result cannot be tied to the supplied source hashes.

## Interpretation boundary

| Outcome | Allowed conclusion |
| --- | --- |
| Pass | This Gamma realization warrants a preregistered causal-integration test. |
| Fail against ordinary controls | Its structured retrieval did not add enough predictive information beyond simpler memory. |
| Fail against shuffled history | Signature-consequence pairing was not sufficiently informative under this protocol. |
| Invalid | Repair the instrument and rerun without interpreting Gamma. |

None of these outcomes proves or disproves consciousness, moral meaning, universal causality, or Gamma as an entire architectural family.
