'use strict';

const fs = require('fs');
const path = require('path');
const Gamma = require('../src/EL-EXP-GAMMA-003-core.js');

const fullExcludedSeed = Gamma.runSeed(Gamma.DEFAULT_CONFIG.commissioningSeed, Gamma.DEFAULT_CONFIG);
const distinctPayloadDigestCount = new Set(Object.values(fullExcludedSeed.armPayloadDigests)).size;
const fullFieldPass = distinctPayloadDigestCount === Gamma.ARM_NAMES.length &&
  Object.values(fullExcludedSeed.modelMetrics).every((metric) => metric.count === Gamma.DEFAULT_CONFIG.testEvents) &&
  Object.values(fullExcludedSeed.modelMetrics).every((metric) => Number.isFinite(metric.rmse));

const result = {
  schema: 'EL-EXP-GAMMA-003-commissioning-v1',
  buildId: Gamma.BUILD_ID,
  protocolId: Gamma.PROTOCOL_ID,
  commissioningSeed: Gamma.DEFAULT_CONFIG.commissioningSeed,
  officialSeedUsed: Gamma.CONFIRMATORY_SEEDS.includes(Gamma.DEFAULT_CONFIG.commissioningSeed),
  commissioning: Gamma.runCommissioning(),
  fullExcludedSeed: {
    seed: fullExcludedSeed.seed,
    pass: fullFieldPass,
    modelMetrics: fullExcludedSeed.modelMetrics,
    armPayloadDigests: fullExcludedSeed.armPayloadDigests,
    distinctPayloadDigestCount,
    archiveSizes: fullExcludedSeed.archiveSizes,
    roundedFinalWorldDigest: fullExcludedSeed.roundedFinalWorldDigest
  }
};
if (result.officialSeedUsed || !result.commissioning.pass || !fullFieldPass) throw new Error('Commissioning failed');
const canonical = Gamma.stableStringify(result);
result.scientificFingerprint = Gamma.fnv1a(canonical);
const output = path.join(__dirname, 'EL-EXP-GAMMA-003-commissioning-output.json');
fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(`PASS ${result.commissioning.passed} / ${result.commissioning.total} commissioning checks`);
console.log(`PASS full excluded-seed field produced ${distinctPayloadDigestCount} / ${Gamma.ARM_NAMES.length} distinct arm payloads`);
console.log(`OUTPUT ${output}`);
