# Emergence Lab V2 Site/Lab Integration

This branch adds the V2 website and live lab without overwriting the existing legacy simulator.

## Added

- `site/index.html`
- `lab/index.html`
- `shared/el-bridge.js`
- `shared/el-style.css`
- `shared/node-viz.js`
- `docs/Emergence_Lab_Research_Brief_V2.md`

## Design rule

The node is restored as an atom-inspired spatial object. Future simplification must preserve:

- nucleus/core
- X/Y/Z spatial axes
- Z1 recovery and Z2 integration
- radial/orbital motion
- theta resonance
- gamma forward influence
- node/environment reciprocity

## Website ↔ Lab link

The site can command the lab; the lab streams telemetry back to the site through BroadcastChannel, localStorage, and iframe postMessage.
