# Emergence Lab V2 — Website/Lab Demonstrator Notes

**Status:** Public interface implementation notes (not canonical model law).

This V2 website and browser demonstration coexist with, rather than replace, the legacy simulator and versioned public experiments.

## Components

- `site/index.html` — interface and high-level project context
- `lab/index.html` — visual demonstration
- `shared/el-bridge.js` — local communication between the site and demo
- `shared/el-style.css` and `shared/node-viz.js` — presentation
- `docs/Emergence_Lab_Research_Brief_V2.md` — scope and architecture distinctions

## Visualization vs. architecture

The nucleus, X/Y/Z **drawing axes**, radial and orbital motion, and coupling effects are visual metaphors. Do not mistake the drawings' spatial axes for the canonical state coordinates. The canonical node uses five structured states X, Y, Z1, Z2, and Θ; Gamma and energy remain separate quantities.

The demo's numeric readouts and transfers are not independent tests of emergent intelligence, Γ, quantum behavior, or fully specified RSMA dynamics.

## Communication

The V2 interface may exchange controls and demonstration telemetry using BroadcastChannel, localStorage, and iframe postMessage. That connection is **within the browser demonstration**, not a bridge into private research data or experiments.

## Publication

Public, versioned evidence and approved documents are distinct from active unpublished research. See `PUBLICATION-BOUNDARY.md`.
