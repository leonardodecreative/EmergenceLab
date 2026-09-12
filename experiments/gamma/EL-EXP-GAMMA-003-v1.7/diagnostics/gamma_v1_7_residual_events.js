'use strict';

const fs = require('fs');
const path = require('path');
const Gamma = require('../src/EL-EXP-GAMMA-003-core.js');
const Base = require('../reference/EL-EXP-GAMMA-002-v1.6-core.js');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function archiveSupport(entries, signature, event, config) {
  let kernelMass = 0;
  let squaredWeightMass = 0;
  let nearestDistance = null;
  let sameKindCount = 0;
  let sameDirectedPairKindCount = 0;
  entries.forEach((entry) => {
    const distance = Base.familyBalancedDistance(
      signature,
      entry.signature,
      Base.SIGNATURE_FAMILIES,
      true
    );
    const kernel = Math.exp(-(distance * distance) / (2 * config.sigma * config.sigma));
    const weight = entry.confidence * kernel;
    kernelMass += weight;
    squaredWeightMass += weight * weight;
    nearestDistance = nearestDistance === null ? distance : Math.min(nearestDistance, distance);
    if (entry.kind === event.kind) {
      sameKindCount += 1;
      if (entry.actorId === event.actorId && entry.targetId === event.targetId) {
        sameDirectedPairKindCount += 1;
      }
    }
  });
  return {
    archiveSize: entries.length,
    kernelMass,
    effectiveKernelEntries: squaredWeightMass > 0
      ? (kernelMass * kernelMass) / squaredWeightMass
      : 0,
    nearestDistance,
    sameKindCount,
    sameDirectedPairKindCount
  };
}

function runSeed(seed, config) {
  let world = Base.createWorld(seed, config);
  for (let tick = 0; tick < config.warmupTicks; tick += 1) {
    Base.stepWorld(world, null);
  }
  const archives = Array.from(
    { length: config.nodeCount },
    () => new Gamma.MeaningArchive(config.archiveCapacity)
  );
  const records = [];
  const schedule = Base.scheduleEvents(seed, config);

  schedule.forEach((event) => {
    const archive = archives[event.targetId];
    const preWorld = clone(world);
    const signature = Base.eventSignature(preWorld, event);
    const frame = Gamma.contextFrame(Base.contextVector(preWorld, event.targetId));
    const support = event.phase === 'test'
      ? archiveSupport(archive.entries, signature, event, config)
      : null;
    const measured = Base.measureEvent(preWorld, event, config.horizon);
    const typed = Gamma.typedConsequence(measured.consequence);

    if (event.phase === 'test') {
      records.push({
        seed,
        eventId: event.eventId,
        tick: preWorld.tick,
        actorId: event.actorId,
        targetId: event.targetId,
        kindIndex: event.kind,
        kind: Base.EVENT_KINDS[event.kind],
        strength: event.strength,
        currentFrame: frame,
        typedConsequence: typed,
        support
      });
    }

    archive.record({
      eventId: event.eventId,
      signature: measured.signature,
      consequence: measured.consequence,
      typedConsequence: typed,
      writeContext: frame,
      meaningAtWrite: Gamma.bindMeaning(frame, typed),
      actorId: event.actorId,
      targetId: event.targetId,
      kind: event.kind,
      strength: event.strength,
      confidence: 1,
      tick: preWorld.tick,
      horizon: config.horizon
    });
    world = measured.factual;
  });

  return {
    seed,
    roundedFinalWorldDigest: Gamma.roundedWorldDigest(world, config.scientificRoundingDecimals),
    records
  };
}

function main() {
  const start = Number.parseInt(process.argv[2], 10);
  const end = Number.parseInt(process.argv[3], 10);
  const outputName = process.argv[4];
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > 30 || start > end || !outputName) {
    throw new Error('Usage: node gamma_v1_7_residual_events.js START END OUTPUT.json');
  }
  const seeds = Gamma.CONFIRMATORY_SEEDS.slice(start - 1, end);
  const seedResults = seeds.map((seed) => runSeed(seed, Gamma.DEFAULT_CONFIG));
  const output = {
    schema: 'EL-EXP-GAMMA-003-DIAG-002-events-v1',
    status: 'exploratory-post-confirmatory',
    buildId: Gamma.BUILD_ID,
    seedRange: [start, end],
    seeds,
    contextFamilies: Base.CONTEXT_FAMILIES,
    eventKinds: Base.EVENT_KINDS,
    seedResults
  };
  const outputPath = path.resolve(outputName);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  process.stdout.write(`SUCCESS ${start}-${end}: ${outputPath}\n`);
}

main();
