'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const V15 = require('../reference/EL-EXP-GAMMA-001-v1.5-core.js');
const V16 = require('../src/EL-EXP-GAMMA-002-core.js');

const SEED = 13579;
const OUTPUT_PATH = path.join(__dirname, 'EL-EXP-GAMMA-002-commissioning-output.json');

function roundScientific(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number(value.toFixed(12));
  }
  if (Array.isArray(value)) return value.map(roundScientific);
  if (value && typeof value === 'object') {
    const output = {};
    Object.keys(value).sort().forEach((key) => {
      output[key] = roundScientific(value[key]);
    });
    return output;
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(roundScientific(value));
}

function sha256(value) {
  return crypto.createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function sharedConfig(source) {
  return {
    nodeCount: source.nodeCount,
    warmupTicks: source.warmupTicks,
    horizon: source.horizon,
    acquisitionEvents: source.acquisitionEvents,
    testEvents: source.testEvents,
    archiveCapacity: source.archiveCapacity,
    sigma: source.sigma,
    epsilon: source.epsilon,
    recencyWindow: source.recencyWindow,
    primaryImprovementMargin: source.primaryImprovementMargin,
    shuffledImprovementMargin: source.shuffledImprovementMargin,
    minimumMeanConsequenceMagnitude: source.minimumMeanConsequenceMagnitude,
    commissioningSeed: SEED,
    strengthLevels: source.strengthLevels.slice()
  };
}

function main() {
  const config15 = sharedConfig(V15.DEFAULT_CONFIG);
  const config16 = sharedConfig(V16.DEFAULT_CONFIG);
  assert.deepStrictEqual(config16, config15, 'shared frozen parameters differ');

  const schedule15 = V15.scheduleEvents(SEED, config15);
  const schedule16 = V16.scheduleEvents(SEED, config16);
  assert.strictEqual(V15.stableStringify(schedule15), V16.stableStringify(schedule16), 'event schedules differ');

  const result15 = V15.runSeed(SEED, config15);
  const result16 = V16.runSeed(SEED, config16);

  assert.strictEqual(result16.finalWorldDigest, result15.finalWorldDigest, 'final-world digest differs');
  assert.strictEqual(
    V16.stableStringify(result16.finalWorld),
    V15.stableStringify(result15.finalWorld),
    'final world differs'
  );
  assert.deepStrictEqual(result16.archiveSizes, result15.archiveSizes, 'archive sizes differ');

  const frozenModelNames = [
    'zero',
    'recency',
    'typeMean',
    'pairTypeMean',
    'stateKernel',
    'shuffledGammaRelational',
    'gammaRelational',
    'shuffledGammaDyadic',
    'gammaDyadic'
  ];
  frozenModelNames.forEach((name) => {
    assert.strictEqual(
      canonicalJson(result16.modelMetrics[name]),
      canonicalJson(result15.modelMetrics[name]),
      `${name} changed from v1.5`
    );
  });

  assert.strictEqual(result16.testRecords.length, result15.testRecords.length, 'test record count differs');
  result16.testRecords.forEach((record16, index) => {
    const record15 = result15.testRecords[index];
    ['eventId', 'actorId', 'targetId', 'kind', 'strength', 'tick', 'consequenceMagnitude'].forEach((field) => {
      assert.strictEqual(canonicalJson(record16[field]), canonicalJson(record15[field]), `test record ${index} ${field} differs`);
    });
  });

  const linearRmse = result16.modelMetrics.gammaRelational.balancedRmse;
  const circularRmse = result16.modelMetrics.gammaRelationalCircular.balancedRmse;
  const naturalCircularPredictionChanged = Number(circularRmse.toFixed(15)) !== Number(linearRmse.toFixed(15));

  const querySignature = Array(V16.SIGNATURE_WIDTH).fill(0);
  querySignature[10] = 0.01;
  const wrapSignature = querySignature.slice();
  wrapSignature[10] = 0.99;
  const distantSignature = querySignature.slice();
  distantSignature[10] = 0.50;
  const positiveConsequence = Array(V16.CONSEQUENCE_WIDTH).fill(0);
  positiveConsequence[0] = 0.50;
  const negativeConsequence = Array(V16.CONSEQUENCE_WIDTH).fill(0);
  negativeConsequence[0] = -0.50;
  const syntheticArchive = {
    entries: [
      { signature: wrapSignature, consequence: positiveConsequence, confidence: 1, actorId: 0, kind: 0 },
      { signature: distantSignature, consequence: negativeConsequence, confidence: 1, actorId: 0, kind: 0 }
    ]
  };
  const syntheticPredictions = V16.predictionsFor(
    syntheticArchive,
    querySignature,
    { actorId: 0, kind: 0 },
    config16
  );
  assert.notStrictEqual(
    Number(syntheticPredictions.gammaRelationalCircular[0].toFixed(15)),
    Number(syntheticPredictions.gammaRelational[0].toFixed(15)),
    'synthetic wrap-boundary archive did not activate circular retrieval'
  );

  const scientific = {
    schema: 'EL-EXP-GAMMA-002-commissioning-v1',
    status: 'NON-EVIDENTIARY',
    seed: SEED,
    buildId: V16.BUILD_ID,
    protocolId: V16.PROTOCOL_ID,
    circularPhaseIndices: V16.CIRCULAR_PHASE_INDICES,
    sharedConfig: config16,
    scheduleHash: sha256(schedule16),
    finalWorldDigest: result16.finalWorldDigest,
    archiveSizes: result16.archiveSizes,
    testEventCount: result16.testRecords.length,
    frozenLinearMetrics: Object.fromEntries(frozenModelNames.map((name) => [name, result16.modelMetrics[name]])),
    circularMetrics: {
      shuffledGammaRelationalCircular: result16.modelMetrics.shuffledGammaRelationalCircular,
      gammaRelationalCircular: result16.modelMetrics.gammaRelationalCircular
    },
    naturalCircularPredictionChanged,
    syntheticWrapBoundaryPrediction: {
      linear: syntheticPredictions.gammaRelational[0],
      circular: syntheticPredictions.gammaRelationalCircular[0]
    },
    assertions: {
      sharedParametersIdentical: true,
      scheduleIdentical: true,
      worldAndConsequencesIdentical: true,
      archiveWritesIdentical: true,
      frozenPredictionsIdentical: true,
      circularRetrievalPathActive: true
    }
  };
  const output = {
    ...scientific,
    roundedScientificSha256: sha256(scientific)
  };
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`PASS Seed ${SEED} v1.5/v1.6 parity commissioning`);
  console.log(`PASS synthetic circular retrieval path is active`);
  console.log(`INFO natural Seed ${SEED} aggregate prediction changed: ${naturalCircularPredictionChanged}`);
  console.log(`SHA-256 ${output.roundedScientificSha256}`);
  console.log(`OUTPUT ${OUTPUT_PATH}`);
}

main();
