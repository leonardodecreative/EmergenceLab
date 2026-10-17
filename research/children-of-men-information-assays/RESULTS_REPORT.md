# Children of Men — three completed information assays (2026-10-17)

**Status:** COMPLETED EXPLORATORY EXPERIMENTS; NOT evidence of artificial life, RSMA individuality, consciousness, or autonomous communication.

**Source:** Unmodified BCS-1 binary 64×64 periodic local law, compared to inert N0 and the declared linear comparator. These experiments are distinct from the still-unfrozen AL-CR-ALIFE-001 reproduction-confirmation plan. No ALife reproduction seeds or canonical RSMA dynamics were changed.

## Fixed preregistration
The frozen preregistration was written and SHA-256 recorded **before** the first execution:
`d96b78cc63c7d1cb9622f16d7a405770d0cf736907251c41ba94cb6e2e2f18a9`.

192 independent random backgrounds in total (96 training and 96 held-out). For each background both symbol branches were constructed by forcing one center cell to 0 or 1. Model/condition-specific Bernoulli Naive Bayes observer (`alpha=1.0`) was trained exclusively on training backgrounds and evaluated blind on held-out backgrounds. Held-out accuracy is over 192 examples from 96 paired backgrounds, with 1000 test-background block-bootstrap replicates. Predeclared decoding criterion: accuracy ≥0.70 AND bootstrap lower 95% bound >0.50. Descriptive intervals are not adjusted for multiple readouts.

## Results

| Assay | BCS-1 readout | Held-out blind decode | 95% block-bootstrap interval | Paired distant/local difference | Decision |
|---|---|---:|---|---:|---|
| INFO-001 retention | center 9×9, t=0 | 1.000 | [1.000,1.000] | 100% | source control |
| INFO-001 retention | center 9×9, t=8 | 0.599 | [0.547,0.656] | 100% | criterion NOT met |
| INFO-001 retention | center 9×9, t=16 | 0.490 | [0.422,0.562] | 100% | criterion NOT met |
| INFO-001 retention | center 9×9, t=24 | 0.484 | [0.417,0.552] | 100% | **primary NOT met** |
| INFO-002 transfer | east receiver 9×9, t=4 | 0.500 | [0.500,0.500] | 0% | finite-speed control passes |
| INFO-002 transfer | east receiver 9×9, t=16 | 0.490 | [0.464,0.516] | 21.9% | criterion NOT met |
| INFO-002 transfer | east receiver 9×9, t=24 | 0.495 | [0.458,0.536] | 50% | **primary NOT met** |
| INFO-003 damage | center 9×9 erased t=8, receiver t=24 | 0.479 | [0.453,0.500] | 28.1% | **primary NOT met** |
| INFO-003 damage | center 17×17 erased t=8 | 0.500 | [0.500,0.500] | 0% | expected causal-cone erasure passes |
| INFO-003 damage | center 9×9 erased t=0 | 0.500 | [0.500,0.500] | 0% | expected complete input removal passes |
| INFO-003 damage | sham 9×9 erased far east t=8 | 0.495 | [0.453,0.536] | 50% | criterion NOT met |

The inert and linear comparator results, every individual background diagnostic, all 33 fixed model/readout summary entries, preregistration, source code, and integrity logs are in the exact reproducibility package supplied with the research handoff.

## Conclusions

1. A binary input can alter subsequent BCS-1 states while **not** remaining reliably decodable after 24 ticks by the frozen blind observer. Causal trace ≠ usable memory.
2. BCS-1 transmits **some causal influence** to distant cells, but the predeclared blind remote decoding criterion was not met. Influence ≠ communication.
3. Some causal traces survive limited central damage; sufficiently large or immediate erasure eliminates the input completely. This is **not** demonstrated functional repair, recovery, distributed memory, or organismhood.

Full initial and repeated runs produced byte-identical result and raw CSV hashes. Eight assay unit tests passed; separately written scalar BCS-1 step agreed with NumPy on 24 states.

## Scope / provenance

This branch is an isolated public research record explicitly requested by the project lead. It does **not** publish private RSMA dynamics, conceptual Gamma laws, unreleased Clean Room protocol drafts, or any scientific claim about an emergent Child of Man. The research design's original frozen hash remains recorded above. Store and verify exact artifacts before further use.

**Research direction:** the next relevant hurdle is retaining and transmitting genuinely *decodable* information under a model with an approved input/transmission law. Do not relabel negative findings as success.
