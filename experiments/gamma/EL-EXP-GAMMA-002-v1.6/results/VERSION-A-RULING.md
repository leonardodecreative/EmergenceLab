# EL-EXP-GAMMA-002 v1.6 — Version A Ruling

## Final verdict

`DO_NOT_ADVANCE_CIRCULAR_PHASE_GAMMA_V1_6`

The circular-phase repair failed all four substantive single-run advancement gates. Independent replication passed after Version A applied the preregistered 12-decimal comparison rule correctly.

## B/C discrepancy

Bobby B and Codex C used the same build, protocol, configuration, core SHA-256, seed order, and N=30 field. Their original final hashes differed because three `finalWorldDigest` strings were computed from unrounded runtime floats.

Across the seed-level payloads there were 58 numerical differences. The largest was approximately `1.11e-15`; every difference vanished at 12-decimal rounding. After removing only the noncompliant raw world digests and derivative batch hashes, the complete scientific payloads matched:

```text
9ed3471b9d203e4494cde80f5b41c0c7632e03c56bcb43383ff71e0159e2f037
```

Version A therefore classifies the mismatch as a fingerprint-instrument defect rather than a scientific replication failure.

## Result

| Comparison | Pooled improvement | Required | Passed |
| --- | ---: | ---: | :---: |
| Circular Gamma vs best ordinary control | 0.88% | 5.00% | No |
| Circular Gamma vs shuffled circular Gamma | 7.95% | 10.00% | No |
| Circular Gamma vs linear v1.5 Gamma | 0.000009% | Positive sign test | No |

The repair-specific effect was essentially zero. Circular geometry was mathematically cleaner but empirically inert under this field, archive, bandwidth, and event schedule.

## Boundary

This result rejects the circular-distance repair as the next Gamma realization. It does not eliminate consequential-history architectures, causal-history archives, alternative signature representations, adaptive retrieval, multi-timescale consequence settlement, or causal Gamma feedback.

## Instrument correction

Future cross-runtime fingerprints must canonicalize and round world-state floats to 12 decimals before hashing. Raw JavaScript floating-point serialization must not be used as a cross-platform scientific digest.
