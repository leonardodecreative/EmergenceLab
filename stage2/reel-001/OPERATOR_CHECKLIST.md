# EL-EXP-REEL-001 — Operator Checklist

- [ ] Branch: `stage2/reel-001`
- [ ] Runtime: `EL-EXP-REEL-001_FACTORIAL.html`
- [ ] Header says FINAL PREREGISTERED 2×2 FACTORIAL RUNTIME
- [ ] READY / PAUSED
- [ ] Tick 0
- [ ] Seed 42
- [ ] 4 nodes per arm
- [ ] A resonance/pulse
- [ ] B resonance/no pulse
- [ ] C frozen/pulse
- [ ] D frozen/no pulse
- [ ] Integrity PASS
- [ ] A=B YES
- [ ] C=D YES
- [ ] Pulse counts 0/0/0/0
- [ ] Export Tick 0

Then run only:

`0 → 25 → 50 → 75 → 100 → 150`

At each automatic pause: verify Integrity PASS, record observations only, export JSON.

After Tick 50: next Start causes the automatic Tick-51 Node-1 pulse in A and C only.

At Tick 75 and later: pulse counts must be `1/0/1/0`.

At Tick 150: export JSON and STOP. Interpretation begins only after the final export is secured.
