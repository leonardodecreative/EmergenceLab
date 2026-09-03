# Emergence Lab Public Authorship and Provenance Record

**Record version:** 1.0  
**Record date:** September 3, 2026  
**Author / architect:** Robert J. S. Cebula ("Bobby")  
**Project:** Emergence Lab  
**Repository:** <https://github.com/leonardodecreative/EmergenceLab>  
**Purpose:** Public, noncommercial authorship and research-provenance record

## Declaration

This record identifies Robert J. S. Cebula as the author and architect of the Emergence Lab research program and records the project-specific structured node-state architecture, its lineage, and the exact cryptographic fingerprints of two controlling white-paper artifacts supplied for this record.

This is a public attribution and integrity record. It is not a patent filing, proof of scientific validity, proof that every component is novel in isolation, or a claim over general mathematics, coupled oscillators, complex systems, multi-agent systems, or sim-to-real research. The specific claim recorded here concerns the assembled Emergence Lab architecture, its functional decomposition, its documented lineage, and its use in the project's experimental program.

## Canonical Stage 2 node-state architecture

The current conceptual node is a five-coordinate structured state:

$$
\mathbf{N}_i(t)=\left(\mathbf{X}_i(t),\mathbf{Y}_i(t),\mathbf{Z}_{1i}(t),\mathbf{Z}_{2i}(t),\mathbf{\Theta}_i(t)\right)\in\mathcal{N}.
$$

Bold symbols emphasize that each coordinate is treated as structured and non-scalar; the expression is not five unrelated diagnostic numbers.

- $\mathbf{X}_i(t)$ - persistent identity-like structure affecting later response and transformation.
- $\mathbf{Y}_i(t)$ - perception, temporal sequence assembly, and memory-bearing state.
- $\mathbf{Z}_{1i}(t)$ - failure-triggered recovery, recoil, or compensatory-response structure.
- $\mathbf{Z}_{2i}(t)$ - qualified integration-attempt and successful-transfer-response structure; qualification does not guarantee durable integration.
- $\mathbf{\Theta}_i(t)$ - continuous resonance state, provisionally containing frequency, phase, amplitude, and coherence components.

A compact provisional representation of the resonance state is

$$
\mathbf{\Theta}_i(t)=\left(\boldsymbol{\omega}_i(t),\boldsymbol{\phi}_i(t),\mathbf{a}_i(t),c_i(t)\right).
$$

The final dimensionality, component bases, physical interpretation, and complete transition maps remain open research questions.

## Gamma and supplementary state

Energy, consequential history, and active perceptual traces are deliberately kept outside the five-coordinate node tuple. A supplementary state may be written

$$
\mathbf{H}_i(t)=\left(E_i(t),\Gamma_i(t),P_i(t)\right).
$$

Here $E_i$ is a normalized computational or activation budget, $\Gamma_i$ is provisional consequential history or compressed scarring, and $P_i$ contains active perceptual traces. Gamma is not a sixth coordinate of the canonical Stage 2 node. It was not made causal in EL-EXP-REEL-001, and its final mathematics remain unresolved. The architecture therefore must not be represented as a completed six-tuple $\left(X,Y,Z_1,Z_2,\Theta,\Gamma\right)$ unless a later, explicit architectural revision adopts that change.

A general transition context can be stated without pretending that the unresolved transition law is complete:

$$
\mathbf{N}_i(t+1)=\mathcal{F}\!\left(\mathbf{N}_i(t),\mathbf{H}_i(t),\mathcal{E}(t),\{\mathbf{N}_j(t):j\in\mathcal{R}_i(t)\}\right),
$$

where $\mathcal{E}(t)$ denotes environmental state or forcing and $\mathcal{R}_i(t)$ denotes the node's current relational neighborhood.

## Architectural lineage

1. Earlier controlled experiments used a frozen legacy runtime with $\mathbf{N}_i(t)=(X_i(t),Y_i(t),Z_i(t),\Theta_i(t))$, where $\Theta$ was already non-scalar.
2. Continued architecture work separated $Z$ into distinct $Z_1$ and $Z_2$ processes so failed-transfer recovery and qualified integration would not be silently treated as one operation.
3. Gamma developed as a separate consequential-history concept. It remains provisional and must not be projected backward into experiments that did not implement it.
4. Stage 2's first closed controlled experiment, EL-EXP-REEL-001, used structured $X$, $Y$, $Z_1$, $Z_2$, and $\Theta$ states, with excitation handled as auxiliary flow rather than another identity coordinate.

Later architecture does not retroactively alter what earlier runtimes implemented or what earlier experiments can support.

## Reproducibility anchors

- Canonical repository: `leonardodecreative/EmergenceLab`
- Closed Stage 2 branch: `stage2/reel-001`
- Canonical EL-EXP-REEL-001 commit: `3aedce78ad3c379bf5f42ecdb91dac77aea543f5`
- Canonical runtime: `stage2/reel-001/EL-EXP-REEL-001_FACTORIAL.html`
- Runtime SHA-256: `e8060e48c38d82150591cc012525f56161ee412e3961376e364173ad61092870`
- Protocol SHA-256: `272385933f8c1b406e1a0711e8317f26046b2655aecb784aeebf5072889fb48b`

## Controlling document fingerprints

The following hashes bind this public record to the exact PDF bytes reviewed on September 3, 2026. The dates below are the dates printed in the documents; the GitHub commit containing this record supplies the public repository timestamp for these fingerprints.

| Artifact | Printed date | Pages | Bytes | SHA-256 |
| --- | --- | ---: | ---: | --- |
| Stage 1 OG White Paper, circulation copy v4 | August 27, 2026 | 86 | 979,276 | `a763f0dbc1d1422a1c6fd9e473639af3fe515e26b044adaed9f09066af3c4f9a` |
| Stage 2 Master White Paper, working revision | September 2, 2026 | 14 | 189,050 | `197cff74e77bd2b999e1a4d514da436aaa3cd145341fa84e5c168356deb2c939` |

The full source filenames and machine-checkable hash lines are preserved in `SHA256SUMS.txt` beside this record.

## Attribution boundary

The author does not claim ownership of generic symbols such as $X$, $Y$, $Z$, $\Theta$, or $\Gamma$, nor of established scientific fields or prior art. The attribution claim concerns the documented Emergence Lab assembly: the structured five-coordinate node; the project-specific functional separation of identity, memory/perception, failure-triggered response, integration attempt, and resonance; the distinct supplementary consequential-history layer; and the associated experimental lineage and methods.

Repository source code remains available under the repository's MIT License. The preferred project attribution is supplied in the root `CITATION.cff` file.

## Preferred citation

Cebula, Robert J. S. (2026). *Emergence Lab: Public Authorship and Provenance Record for the Structured Node-State Architecture* (Version 1.0). Emergence Lab. <https://github.com/leonardodecreative/EmergenceLab/tree/main/docs/provenance/2026-09-03>

## Verification

To verify a local copy of either controlling PDF, calculate its SHA-256 digest and compare the 64-character result with the table above. A matching digest means the bytes are identical to the artifact fingerprinted by this public record.

---

Copyright (c) 2026 Robert J. S. Cebula. Record prepared for the Emergence Lab public repository.
