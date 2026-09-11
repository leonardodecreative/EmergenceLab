'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const Gamma = require(path.join(__dirname, '..', 'src', 'EL-EXP-GAMMA-001-core.js'));

const startSeed = Number.parseInt(process.argv[2], 10);
const endSeed = Number.parseInt(process.argv[3], 10);
const outputPath = process.argv[4];

if (!Number.isInteger(startSeed) || !Number.isInteger(endSeed) || startSeed > endSeed || !outputPath) {
  throw new Error('Usage: node gamma_v1.5_diagnostic_extractor.js START END OUTPUT.json');
}

const expectedCoreSha256 = '33d4c44561382c581625aa801347b5da7d7e1c901b2cb6cdff9694b1211ead85';
const corePath = path.join(__dirname, '..', 'src', 'EL-EXP-GAMMA-001-core.js');
const actualCoreSha256 = crypto.createHash('sha256').update(fs.readFileSync(corePath)).digest('hex');
if (actualCoreSha256 !== expectedCoreSha256) throw new Error(`Frozen core hash mismatch: ${actualCoreSha256}`);
if (Gamma.BUILD_ID !== 'EL-EXP-GAMMA-001-v1.5.0') throw new Error(`Wrong build: ${Gamma.BUILD_ID}`);

const config = JSON.parse(JSON.stringify(Gamma.DEFAULT_CONFIG));
const selectedModels = [
  'typeMean',
  'pairTypeMean',
  'gammaRelational',
  'gammaDyadic',
  'shuffledGammaRelational'
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function extractSeed(seed) {
  let world = Gamma.createWorld(seed, config);
  for (let tick = 0; tick < config.warmupTicks; tick += 1) Gamma.stepWorld(world, null);

  const archives = Array.from(
    { length: config.nodeCount },
    () => new Gamma.GammaArchive(config.archiveCapacity)
  );
  const schedule = Gamma.scheduleEvents(seed, config);
  const events = [];
  const phaseCounts = { acquisition: 0, test: 0 };

  schedule.forEach((event) => {
    phaseCounts[event.phase] += 1;
    const archive = archives[event.targetId];
    const signature = Gamma.eventSignature(world, event);
    const predictions = event.phase === 'test'
      ? Gamma.predictionsFor(archive, signature, event, config)
      : null;
    const measured = Gamma.measureEvent(world, event, config.horizon);

    if (event.phase === 'test') {
      const selectedPredictions = {};
      selectedModels.forEach((name) => {
        selectedPredictions[name] = predictions[name];
      });
      events.push({
        eventId: event.eventId,
        actorId: event.actorId,
        targetId: event.targetId,
        kindIndex: event.kind,
        kind: Gamma.EVENT_KINDS[event.kind],
        strength: event.strength,
        tick: world.tick,
        signature,
        consequence: measured.consequence,
        predictions: selectedPredictions,
        archiveSizeBeforePrediction: archive.entries.length
      });
    }

    archive.record({
      eventId: event.eventId,
      signature: measured.signature,
      consequence: measured.consequence,
      actorId: event.actorId,
      targetId: event.targetId,
      kind: event.kind,
      strength: event.strength,
      confidence: 1,
      tick: world.tick,
      horizon: config.horizon
    });
    world = measured.factual;
  });

  return {
    seed,
    phaseCounts,
    finalWorldDigest: Gamma.fnv1a(Gamma.stableStringify(world)),
    archiveSizes: archives.map((archive) => archive.entries.length),
    events
  };
}

const seeds = [];
for (let seed = startSeed; seed <= endSeed; seed += 1) seeds.push(seed);
const result = {
  schema: 'EL-EXP-GAMMA-001-v1.5-diagnostic-events-v1',
  buildId: Gamma.BUILD_ID,
  protocolId: Gamma.PROTOCOL_ID,
  coreSha256: actualCoreSha256,
  config,
  configHash: Gamma.fnv1a(Gamma.stableStringify(config)),
  selectedModels,
  contextChannels: Gamma.CONTEXT_CHANNELS,
  contextFamilies: Gamma.CONTEXT_FAMILIES,
  signatureFamilies: Gamma.SIGNATURE_FAMILIES,
  seeds: seeds.map(extractSeed)
};

fs.writeFileSync(outputPath, `${JSON.stringify(result)}\n`, 'utf8');
process.stdout.write(`Wrote ${outputPath} for Seeds ${startSeed}-${endSeed}\n`);
