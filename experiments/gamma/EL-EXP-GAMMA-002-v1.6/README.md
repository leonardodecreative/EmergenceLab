# EL-EXP-GAMMA-002 v1.6 Circular-Phase Candidate

Preregistered noncausal test of one repair nominated by the frozen v1.5 diagnostic: circular distance for normalized Theta phase coordinates during Gamma signature retrieval.

## Status

- Candidate implementation complete.
- JavaScript tests: 15/15 pass.
- Statistical reference tests: 3/3 pass.
- Excluded Seed 13579 commissioning: pass.
- Bobby B confirmatory execution: complete.
- Codex C independent execution: complete.
- Version A adjudication: complete.
- Final verdict: `DO_NOT_ADVANCE_CIRCULAR_PHASE_GAMMA_V1_6`.
- Canonical engine: untouched.

The commissioning seed produced identical aggregate linear and circular RMSE in its natural event field. A deterministic wrap-boundary case confirms that the circular retrieval path is active. This commissioning observation is non-evidentiary and does not alter the frozen confirmatory field.

## Confirmatory result

The candidate failed all four substantive advancement gates. Circular Gamma improved only 0.88% over the best ordinary control, 7.95% over shuffled circular Gamma, and approximately 0.000009% over linear v1.5 Gamma.

Bobby B and Codex C initially produced different final hashes because raw unrounded world-state strings were used to create `finalWorldDigest`. Three seed digests differed across Mac and Linux, while the largest underlying numerical difference was approximately `1.11e-15`. Every numerical difference vanished at the preregistered 12-decimal precision. Version A removed only the defective raw fingerprints and their derivative batch hashes; the remaining complete scientific payloads matched SHA-256 `9ed3471b9d203e4494cde80f5b41c0c7632e03c56bcb43383ff71e0159e2f037`.

See `results/VERSION-A-RULING.md` and `results/gamma_v1.6_A_adjudication.json`.

## Sole implementation change

Circular component distance is applied only to zero-based signature indices `10`, `11`, `12`, `33`, `34`, and `35`:

```text
deltaCircular(a, b) = min(abs(a - b), 1 - abs(a - b))
```

Every other component retains linear absolute distance. The linear v1.5 relational Gamma remains present as a matched comparator. State dynamics, schedules, consequence measurement, archive writes, controls, kernel bandwidth, capacity, and horizon remain unchanged.

## Validation

```bash
node tests/EL-EXP-GAMMA-002-tests.js
python3 tests/test_gamma_v1.6_statistics.py
node tests/EL-EXP-GAMMA-002-commissioning.js
sha256sum -c MANIFEST.sha256
```

## Bobby B confirmatory execution

From the extracted experiment directory, run the complete guarded sequence with one command:

```bash
bash RUN-BOBBY-B.sh
```

The launcher executes these batches separately to avoid long single-process timeouts:

```bash
python3 runners/gamma_v1.6_batch.py --role B --batch 1
python3 runners/gamma_v1.6_batch.py --role B --batch 2
python3 runners/gamma_v1.6_batch.py --role B --batch 3
python3 runners/gamma_v1.6_aggregate.py --role B
```

Codex C must not run before Bobby B is complete and sealed. Codex then uses the same commands with `--role C`. After both summaries exist:

```bash
python3 runners/gamma_v1.6_compare_BC.py
```

The comparison script advances the candidate only if all five preregistered gates pass. A pass authorizes drafting a separate causal Gamma experiment; it does not alter the canonical engine.

See [PREREGISTRATION.md](PREREGISTRATION.md).
