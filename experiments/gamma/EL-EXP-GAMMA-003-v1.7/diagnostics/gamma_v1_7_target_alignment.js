'use strict';

const fs = require('fs');
const path = require('path');
const Gamma = require('../src/EL-EXP-GAMMA-003-core.js');
const Base = require('../reference/EL-EXP-GAMMA-002-v1.6-core.js');

const MODEL_NAMES = Object.freeze([
  'typeMeanMeaning',
  'pairTypeMeanMeaning',
  'consequenceOnly',
  'writeMeaning',
  'readMeaning',
  'dualMeaning'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function zeroVector(width) {
  return Array(width).fill(0);
}

function addVector(target, source) {
  source.forEach((value, index) => {
    target[index] += value;
  });
}

function squaredNorm(vector) {
  return vector.reduce((total, value) => total + value * value, 0);
}

function meanSquaredError(prediction, actual) {
  return prediction.reduce((total, value, index) => {
    const difference = value - actual[index];
    return total + difference * difference;
  }, 0) / prediction.length;
}

function recoverTypedConsequence(prediction, currentFrame) {
  const denominator = currentFrame.reduce((total, value) => total + value * value, 0);
  if (denominator < 1e-18) {
    return zeroVector(Gamma.TYPED_CONSEQUENCE_WIDTH);
  }
  const recovered = zeroVector(Gamma.TYPED_CONSEQUENCE_WIDTH);
  for (let family = 0; family < Gamma.FAMILY_COUNT; family += 1) {
    for (let channel = 0; channel < Gamma.TYPED_CONSEQUENCE_WIDTH; channel += 1) {
      recovered[channel] += currentFrame[family] * prediction[
        family * Gamma.TYPED_CONSEQUENCE_WIDTH + channel
      ];
    }
  }
  return recovered.map((value) => value / denominator);
}

function makeMoment(width) {
  return {
    count: 0,
    sum: zeroVector(width),
    squaredNormSum: 0
  };
}

function addMoment(moment, vector) {
  moment.count += 1;
  addVector(moment.sum, vector);
  moment.squaredNormSum += squaredNorm(vector);
}

function makeModelAccumulator() {
  return {
    count: 0,
    originalMseSum: 0,
    alignedMseSum: 0,
    typedMseSum: 0
  };
}

function addModelObservation(accumulator, prediction, targetMeaning, currentFrame, targetTyped) {
  const recoveredTyped = recoverTypedConsequence(prediction, currentFrame);
  const alignedPrediction = Gamma.bindMeaning(currentFrame, recoveredTyped);
  accumulator.count += 1;
  accumulator.originalMseSum += meanSquaredError(prediction, targetMeaning);
  accumulator.alignedMseSum += meanSquaredError(alignedPrediction, targetMeaning);
  accumulator.typedMseSum += meanSquaredError(recoveredTyped, targetTyped);
}

function makeGroup() {
  return {
    eventCount: 0,
    frameMoment: makeMoment(Gamma.FAMILY_COUNT),
    typedMoment: makeMoment(Gamma.TYPED_CONSEQUENCE_WIDTH),
    meaningMoment: makeMoment(Gamma.MEANING_WIDTH),
    models: Object.fromEntries(MODEL_NAMES.map((name) => [name, makeModelAccumulator()]))
  };
}

function runDiagnosticSeed(seed, config) {
  let world = Base.createWorld(seed, config);
  for (let tick = 0; tick < config.warmupTicks; tick += 1) {
    Base.stepWorld(world, null);
  }

  const archives = Array.from(
    { length: config.nodeCount },
    () => new Gamma.MeaningArchive(config.archiveCapacity)
  );
  const overall = makeGroup();
  const byKind = Object.fromEntries(Base.EVENT_KINDS.map((kind) => [kind, makeGroup()]));
  const schedule = Base.scheduleEvents(seed, config);

  schedule.forEach((event) => {
    const archive = archives[event.targetId];
    const preWorld = clone(world);
    const signature = Base.eventSignature(preWorld, event);
    const currentFrame = Gamma.contextFrame(Base.contextVector(preWorld, event.targetId));
    const predictions = event.phase === 'test'
      ? Gamma.predictionsFor(archive, signature, event, currentFrame, config)
      : null;
    const measured = Base.measureEvent(preWorld, event, config.horizon);
    const targetTyped = Gamma.typedConsequence(measured.consequence);
    const targetMeaning = Gamma.bindMeaning(currentFrame, targetTyped);

    if (event.phase === 'test') {
      const kindName = Base.EVENT_KINDS[event.kind];
      [overall, byKind[kindName]].forEach((group) => {
        group.eventCount += 1;
        addMoment(group.frameMoment, currentFrame);
        addMoment(group.typedMoment, targetTyped);
        addMoment(group.meaningMoment, targetMeaning);
        MODEL_NAMES.forEach((modelName) => {
          addModelObservation(
            group.models[modelName],
            predictions[modelName],
            targetMeaning,
            currentFrame,
            targetTyped
          );
        });
      });
    }

    archive.record({
      eventId: event.eventId,
      signature: measured.signature,
      consequence: measured.consequence,
      typedConsequence: targetTyped,
      writeContext: currentFrame,
      meaningAtWrite: targetMeaning,
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
    overall,
    byKind,
    roundedFinalWorldDigest: Gamma.roundedWorldDigest(world, config.scientificRoundingDecimals)
  };
}

function main() {
  const start = Number.parseInt(process.argv[2], 10);
  const end = Number.parseInt(process.argv[3], 10);
  const outputName = process.argv[4];
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > 30 || start > end) {
    throw new Error('Usage: node gamma_v1_7_target_alignment.js START END OUTPUT.json');
  }
  if (!outputName) {
    throw new Error('Output path is required');
  }
  const seeds = Gamma.CONFIRMATORY_SEEDS.slice(start - 1, end);
  const seedResults = seeds.map((seed) => runDiagnosticSeed(seed, Gamma.DEFAULT_CONFIG));
  const output = {
    schema: 'EL-EXP-GAMMA-003-DIAG-001-batch-v1',
    status: 'exploratory-post-confirmatory',
    buildId: Gamma.BUILD_ID,
    seedRange: [start, end],
    seeds,
    modelNames: MODEL_NAMES,
    method: 'least-squares recovery of each predicted typed consequence followed by rebinding to the current context frame',
    seedResults
  };
  const outputPath = path.resolve(outputName);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  process.stdout.write(`SUCCESS ${start}-${end}: ${outputPath}\n`);
}

main();
