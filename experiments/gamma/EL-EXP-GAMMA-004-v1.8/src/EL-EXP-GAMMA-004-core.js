'use strict';

const Gamma003 = require('../reference/EL-EXP-GAMMA-003-v1.7/src/EL-EXP-GAMMA-003-core.js');
const Base = require('../reference/EL-EXP-GAMMA-003-v1.7/reference/EL-EXP-GAMMA-002-v1.6-core.js');

const BUILD_ID = 'EL-EXP-GAMMA-004-v1.8.0-candidate';
const PROTOCOL_ID = 'ledger-lens-tandem-selector';
const EXPERT_NAMES = Object.freeze(['ledger', 'lens']);
const MODEL_NAMES = Object.freeze([
  'eventTypeStrength',
  'gammaLedger',
  'lambdaLens',
  'legacyDual',
  'tandemSelector'
]);
const CANDIDATE_SEEDS = Object.freeze([
  1905123781, 3344673804, 3058392938, 2408944060, 2091590430,
  2850167134, 971057564, 3818395930, 2755931137, 4067859179,
  4060262032, 1685929515, 1522376007, 1945104714, 2078401519,
  683897624, 2020772043, 1757136121, 2414636604, 893699283,
  948183169, 634206583, 561559565, 2632838323, 3429266844,
  2286919808, 1837609131, 547644902, 4152929247, 2176902161
]);

const DEFAULT_CONFIG = deepFreeze({
  ...clone(Gamma003.DEFAULT_CONFIG),
  officialSeeds: CANDIDATE_SEEDS,
  commissioningSeed: 3141592653,
  lambdaDecay: 0.90,
  lambdaInitialError: 1,
  lambdaMinimumObservations: 4,
  primaryImprovementMargin: 0.05,
  blendImprovementMargin: 0.05,
  worstKindDegradationLimit: 0.10,
  primaryFamilywiseAlpha: 0.05,
  primaryComparisonCount: 4,
  scientificRoundingDecimals: 12
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.keys(value).forEach((key) => deepFreeze(value[key]));
  return Object.freeze(value);
}

function zeroVector(width) {
  return Array(width).fill(0);
}

function assertVector(vector, width, label, minimum = -Infinity, maximum = Infinity) {
  if (!Array.isArray(vector) || vector.length !== width) {
    throw new Error(`${label}: expected width ${width}`);
  }
  vector.forEach((value, index) => {
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
      throw new Error(`${label}: invalid component ${index}`);
    }
  });
}

function recoverTypedConsequence(meaningPrediction, currentFrame) {
  assertVector(meaningPrediction, Gamma003.MEANING_WIDTH, 'meaning prediction', -1, 1);
  assertVector(currentFrame, Gamma003.FAMILY_COUNT, 'current frame', 0, 1);
  const denominator = currentFrame.reduce((total, value) => total + value * value, 0);
  if (denominator < 1e-18) return zeroVector(Gamma003.TYPED_CONSEQUENCE_WIDTH);
  const typed = zeroVector(Gamma003.TYPED_CONSEQUENCE_WIDTH);
  for (let family = 0; family < Gamma003.FAMILY_COUNT; family += 1) {
    for (let channel = 0; channel < Gamma003.TYPED_CONSEQUENCE_WIDTH; channel += 1) {
      typed[channel] += currentFrame[family] * meaningPrediction[
        family * Gamma003.TYPED_CONSEQUENCE_WIDTH + channel
      ];
    }
  }
  return typed.map((value) => value / denominator);
}

function alignMeaningToCurrentFrame(meaningPrediction, currentFrame) {
  return Gamma003.bindMeaning(
    currentFrame,
    recoverTypedConsequence(meaningPrediction, currentFrame)
  );
}

function typeStrengthPrediction(entries, event, currentFrame) {
  const matching = entries.filter((entry) => entry.kind === event.kind);
  if (!matching.length) return zeroVector(Gamma003.MEANING_WIDTH);
  const typed = zeroVector(Gamma003.TYPED_CONSEQUENCE_WIDTH);
  for (let channel = 0; channel < typed.length; channel += 1) {
    const meanStrength = matching.reduce((total, entry) => total + entry.strength, 0) / matching.length;
    const meanValue = matching.reduce((total, entry) => total + entry.typedConsequence[channel], 0) / matching.length;
    let covariance = 0;
    let variance = 0;
    matching.forEach((entry) => {
      covariance += (entry.strength - meanStrength) * (entry.typedConsequence[channel] - meanValue);
      variance += (entry.strength - meanStrength) ** 2;
    });
    const slope = variance > 1e-18 ? covariance / variance : 0;
    typed[channel] = Math.max(-1, Math.min(1, meanValue + slope * (event.strength - meanStrength)));
  }
  return Gamma003.bindMeaning(currentFrame, typed);
}

class LambdaLensState {
  constructor(config = DEFAULT_CONFIG) {
    this.schema = 'lambda-lens-error-state-v1';
    this.decay = config.lambdaDecay;
    this.initialError = config.lambdaInitialError;
    this.minimumObservations = config.lambdaMinimumObservations;
    this.errors = Array.from({ length: Base.EVENT_KINDS.length }, () => ({
      ledger: Array(Gamma003.TYPED_CONSEQUENCE_WIDTH).fill(this.initialError),
      lens: Array(Gamma003.TYPED_CONSEQUENCE_WIDTH).fill(this.initialError)
    }));
    this.counts = Array.from({ length: Base.EVENT_KINDS.length }, () => ({
      ledger: Array(Gamma003.TYPED_CONSEQUENCE_WIDTH).fill(0),
      lens: Array(Gamma003.TYPED_CONSEQUENCE_WIDTH).fill(0)
    }));
  }

  select(kind, ledgerTyped, lensTyped) {
    assertVector(ledgerTyped, Gamma003.TYPED_CONSEQUENCE_WIDTH, 'ledger typed', -1, 1);
    assertVector(lensTyped, Gamma003.TYPED_CONSEQUENCE_WIDTH, 'lens typed', -1, 1);
    return ledgerTyped.map((ledgerValue, channel) => {
      const ledgerCount = this.counts[kind].ledger[channel];
      const lensCount = this.counts[kind].lens[channel];
      if (ledgerCount < this.minimumObservations || lensCount < this.minimumObservations) {
        return ledgerValue;
      }
      return this.errors[kind].lens[channel] < this.errors[kind].ledger[channel]
        ? lensTyped[channel]
        : ledgerValue;
    });
  }

  update(kind, ledgerTyped, lensTyped, actualTyped) {
    [ledgerTyped, lensTyped, actualTyped].forEach((vector, index) => {
      assertVector(vector, Gamma003.TYPED_CONSEQUENCE_WIDTH, `lambda update vector ${index}`, -1, 1);
    });
    EXPERT_NAMES.forEach((expert) => {
      const prediction = expert === 'ledger' ? ledgerTyped : lensTyped;
      prediction.forEach((value, channel) => {
        const squaredError = (value - actualTyped[channel]) ** 2;
        const previous = this.errors[kind][expert][channel];
        this.errors[kind][expert][channel] = this.decay * previous + (1 - this.decay) * squaredError;
        this.counts[kind][expert][channel] += 1;
      });
    });
  }

  serialize() {
    return clone({
      schema: this.schema,
      decay: this.decay,
      initialError: this.initialError,
      minimumObservations: this.minimumObservations,
      errors: this.errors,
      counts: this.counts
    });
  }
}

class MetricAccumulator {
  constructor() {
    this.count = 0;
    this.mseSum = 0;
  }
  add(prediction, actual) {
    assertVector(prediction, Gamma003.MEANING_WIDTH, 'metric prediction', -1, 1);
    assertVector(actual, Gamma003.MEANING_WIDTH, 'metric actual', -1, 1);
    this.count += 1;
    this.mseSum += prediction.reduce((total, value, index) => {
      return total + (value - actual[index]) ** 2;
    }, 0) / prediction.length;
  }
  finalize() {
    return {
      count: this.count,
      rmse: this.count ? Math.sqrt(this.mseSum / this.count) : null
    };
  }
}

function candidatePredictions(archive, lambdaState, signature, event, currentFrame, config) {
  const legacy = Gamma003.predictionsFor(archive, signature, event, currentFrame, config);
  const gammaLedger = alignMeaningToCurrentFrame(legacy.writeMeaning, currentFrame);
  const lambdaLens = alignMeaningToCurrentFrame(legacy.readMeaning, currentFrame);
  const legacyDual = alignMeaningToCurrentFrame(legacy.dualMeaning, currentFrame);
  const ledgerTyped = recoverTypedConsequence(gammaLedger, currentFrame);
  const lensTyped = recoverTypedConsequence(lambdaLens, currentFrame);
  const tandemTyped = lambdaState.select(event.kind, ledgerTyped, lensTyped);
  return {
    eventTypeStrength: typeStrengthPrediction(archive.entries, event, currentFrame),
    gammaLedger,
    lambdaLens,
    legacyDual,
    tandemSelector: Gamma003.bindMeaning(currentFrame, tandemTyped),
    ledgerTyped,
    lensTyped
  };
}

function runSeed(seed, config = DEFAULT_CONFIG) {
  let world = Base.createWorld(seed, config);
  for (let tick = 0; tick < config.warmupTicks; tick += 1) Base.stepWorld(world, null);
  const archives = Array.from({ length: config.nodeCount }, () => new Gamma003.MeaningArchive(config.archiveCapacity));
  const lenses = Array.from({ length: config.nodeCount }, () => new LambdaLensState(config));
  const overall = Object.fromEntries(MODEL_NAMES.map((name) => [name, new MetricAccumulator()]));
  const byKind = Object.fromEntries(Base.EVENT_KINDS.map((kind) => [
    kind,
    Object.fromEntries(MODEL_NAMES.map((name) => [name, new MetricAccumulator()]))
  ]));
  const schedule = Base.scheduleEvents(seed, config);

  schedule.forEach((event) => {
    const archive = archives[event.targetId];
    const lensState = lenses[event.targetId];
    const preWorld = clone(world);
    const signature = Base.eventSignature(preWorld, event);
    const currentFrame = Gamma003.contextFrame(Base.contextVector(preWorld, event.targetId));
    const predictions = candidatePredictions(archive, lensState, signature, event, currentFrame, config);
    const measured = Base.measureEvent(preWorld, event, config.horizon);
    const actualTyped = Gamma003.typedConsequence(measured.consequence);
    const actualMeaning = Gamma003.bindMeaning(currentFrame, actualTyped);

    if (event.phase === 'test') {
      MODEL_NAMES.forEach((name) => {
        overall[name].add(predictions[name], actualMeaning);
        byKind[Base.EVENT_KINDS[event.kind]][name].add(predictions[name], actualMeaning);
      });
    }

    lensState.update(event.kind, predictions.ledgerTyped, predictions.lensTyped, actualTyped);
    archive.record({
      eventId: event.eventId,
      signature: measured.signature,
      consequence: measured.consequence,
      typedConsequence: actualTyped,
      writeContext: currentFrame,
      meaningAtWrite: actualMeaning,
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
    modelMetrics: Object.fromEntries(Object.entries(overall).map(([name, metric]) => [name, metric.finalize()])),
    byEventKind: Object.fromEntries(Object.entries(byKind).map(([kind, metrics]) => [
      kind,
      Object.fromEntries(Object.entries(metrics).map(([name, metric]) => [name, metric.finalize()]))
    ])),
    archiveSizes: archives.map((archive) => archive.entries.length),
    lambdaStates: lenses.map((lens) => lens.serialize()),
    roundedFinalWorldDigest: Gamma003.roundedWorldDigest(world, config.scientificRoundingDecimals)
  };
}

function runCommissioning(config = DEFAULT_CONFIG) {
  const synthetic = new LambdaLensState({ ...clone(config), lambdaMinimumObservations: 1, lambdaDecay: 0 });
  const zero = zeroVector(Gamma003.TYPED_CONSEQUENCE_WIDTH);
  const one = zero.map(() => 0.1);
  synthetic.update(0, zero, one, one);
  const selected = synthetic.select(0, zero, one);
  const shortConfig = {
    ...clone(config),
    warmupTicks: 4,
    acquisitionEvents: 24,
    testEvents: 12,
    horizon: 3,
    archiveCapacity: 12,
    lambdaMinimumObservations: 1
  };
  const first = runSeed(config.commissioningSeed, shortConfig);
  const second = runSeed(config.commissioningSeed, shortConfig);
  const checks = [
    ['candidate seeds are thirty unique values', CANDIDATE_SEEDS.length === 30 && new Set(CANDIDATE_SEEDS).size === 30],
    ['commissioning seed is excluded', !CANDIDATE_SEEDS.includes(config.commissioningSeed)],
    ['lambda learns the lower-error lens expert', selected.every((value) => Math.abs(value - 0.1) < 1e-15)],
    ['commissioning is deterministic', Base.stableStringify(first) === Base.stableStringify(second)],
    ['all five arms emit metrics', Object.keys(first.modelMetrics).length === MODEL_NAMES.length],
    ['lambda state is separate from gamma archive', first.lambdaStates.every((state) => state.schema === 'lambda-lens-error-state-v1')],
    ['canonical node state is not mutated by operator telemetry', first.roundedFinalWorldDigest === second.roundedFinalWorldDigest]
  ].map(([name, pass]) => ({ name, pass }));
  return { pass: checks.every((check) => check.pass), passed: checks.filter((check) => check.pass).length, total: checks.length, checks };
}

module.exports = Object.freeze({
  BUILD_ID,
  PROTOCOL_ID,
  EXPERT_NAMES,
  MODEL_NAMES,
  CANDIDATE_SEEDS,
  DEFAULT_CONFIG,
  LambdaLensState,
  recoverTypedConsequence,
  alignMeaningToCurrentFrame,
  typeStrengthPrediction,
  candidatePredictions,
  runSeed,
  runCommissioning
});
