# Emergence Lab

Experimental research into adaptive, history-dependent, self-organizing node systems.

## Canonical node architecture

```text
N(t) = (X(t), Y(t), Z1(t), Z2(t), Θ(t))
```

All five coordinates are non-scalar structured states.

- **X** — structural identity state.
- **Y** — perceptual and sequence-assembly state.
- **Z1** — failure-triggered recovery or compensatory response. Candidate A keeps Z1 inactive after successful integration; its final physics remains unresolved.
- **Z2** — structural integration-attempt state. Qualification can trigger an attempt but does not guarantee success.
- **Θ** — continuous resonant dynamic state.

Gamma and energy remain separate from the node coordinate tuple and from one another.

## Runnable simulator

The repository includes [`emergenceLabVSSim-z1-z2.html`](./emergenceLabVSSim-z1-z2.html), a dependency-free browser simulator migrated from the former single-Z state shape.

The simulator uses state schema version 2 and architecture version `3.1-z1-z2`. It includes:

- separate non-scalar `Z1` and `Z2` serialized structures;
- deterministic migration of legacy records containing a single numeric `Z`;
- separate UI readouts, controls, defaults, validation, logs, snapshots, reports, and couplings;
- explicit Z2 qualified-attempt instrumentation;
- inactive-by-default Z1 recovery, avoiding invented failure physics;
- embedded migration self-tests.

Open the HTML file in a modern browser to run it.

## Migration policy

A legacy numeric `Z` is copied into the initial components of both new structured states so old values are not silently discarded. That conversion is a compatibility rule, not a claim that Z1 and Z2 are physically identical. New exports omit the old `Z` field and include `schemaVersion` and `architectureVersion`.

Historical equations, constants, and scalar implementations remain historical evidence. They are not silently promoted to current physics.

## Research discipline

The current architecture is provisional where exact dimensions, tensors, equations, substrates, energy laws, Gamma mathematics, Z1 recovery physics, Z2 success conditions, thresholds, and consequence signals remain unresolved.

> Do not program the phenomenon you are trying to discover.

Define the architecture, local rules, and controls. Observe what occurs, attempt to reproduce it, and then try to break the interpretation.

## Authorship, citation, and provenance

Emergence Lab is authored and architected by **Robert J. S. Cebula** (GitHub: `leonardodecreative`). Use [`CITATION.cff`](./CITATION.cff) for the preferred project citation.

The [public authorship and provenance record](./docs/provenance/2026-09-03/PROVENANCE_RECORD.md) distinguishes the canonical five-coordinate node state from supplementary Gamma, records the architecture's legacy-to-Stage-2 lineage, and binds the exact Stage 1 and Stage 2 white-paper artifacts to the repository through SHA-256 fingerprints.

## Status

Active experimental research. The current code demonstrates the structural Z1/Z2 migration; it does not establish final Candidate A mathematics, consciousness, AGI, universal physics, or identity continuity.
