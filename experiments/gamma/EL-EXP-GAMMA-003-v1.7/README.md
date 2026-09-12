# EL-EXP-GAMMA-003 v1.7

Runnable noncausal four-arm experiment comparing consequence-only retrieval, meaning stored at write, meaning reconstructed at read, and their dual combination.

## Important boundary

The word `meaning` names a 98-component context-consequence tensor. It is a structural proxy, not moral value or consciousness. Gamma v1.6 already contained a signed 23-channel consequence vector; v1.7 adds contextual binding rather than pretending to invent typed consequence.

The canonical Emergence Lab engine is untouched. Official execution order is Bobby B, then Codex C, followed by Version A only if needed.

## Frozen commissioning status

- Structural commissioning: 12/12 PASS
- JavaScript tests: 7/7 PASS
- Statistical reference tests: PASS
- Full excluded-seed field: PASS
- Distinct arm payloads: 4/4
- Official confirmatory seeds executed: 30/30 by Bobby B and independently 30/30 by Codex C

## Confirmatory result

- Bobby B: complete.
- Codex C: complete.
- Version A adjudication: complete.
- Independent replication: pass after twelve-decimal adjudication.
- Selected arm: none.
- Final verdict: `DO_NOT_ADVANCE_MEANING_FACTORIAL_V1_7`.

All three meaning arms passed their directional gates and failed only the frozen 5% ordinary-control and 10% shuffled-history magnitude gates. Read meaning ranked first, dual meaning second, and write meaning third on all thirty seeds. See `results/VERSION-A-RULING.md`.

Design caveat: the target meaning tensor uses the present pre-event context, so the read arm shares its context frame by construction. Its ranking is valid for this operational target but is not independent proof that meaning generally originates during retrieval.

## Commissioning

```bash
node tests/EL-EXP-GAMMA-003-tests.js
python3 tests/test_gamma_v1.7_statistics.py
node tests/EL-EXP-GAMMA-003-commissioning.js
```

## Bobby B

```bash
bash RUN-BOBBY-B.sh
```

The launcher validates the frozen manifest, commissions the apparatus, and then runs the official field in three ten-seed batches. Do not run Bobby B until the Senate has reviewed the frozen protocol and package.

After Bobby B's final summary is preserved, Codex C uses:

```bash
bash RUN-CODEX-C.sh
```

That launcher refuses to begin unless Bobby B's final summary is present.

See [PREREGISTRATION.md](PREREGISTRATION.md).
