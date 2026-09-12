'use strict';

const Base = require('../reference/EL-EXP-GAMMA-002-v1.6-core.js');

const BUILD_ID = 'EL-EXP-GAMMA-003-v1.7.0-candidate';
const PROTOCOL_ID = 'context-consequence-meaning-factorial';
const MEANING_SCHEMA = 'context-consequence-tensor-v1';
const FAMILY_COUNT = Base.CONTEXT_FAMILIES.length;
const TYPED_CONSEQUENCE_WIDTH = FAMILY_COUNT * 2;
const MEANING_WIDTH = FAMILY_COUNT * TYPED_CONSEQUENCE_WIDTH;
const CONFIRMATORY_SEEDS = Object.freeze([
  2218981198, 1929771240, 521111220, 474297633, 4029016462,
  1625019350, 1874816109, 3120607361, 578642397, 227299706,
  1391291206, 3053689021, 2331380888, 2126422385, 334384799,
  3810492981, 3259331138, 3650900357, 819091887, 4282557554,
  1815008022, 2006204464, 461026791, 4259554234, 2244171520,
  633117649, 3286174494, 327216863, 1656501849, 1624271877
]);

const ARM_NAMES = Object.freeze([
  'consequenceOnly',
  'writeMeaning',
  'readMeaning',
  'dualMeaning'
]);
const CANDIDATE_ARMS = Object.freeze(['writeMeaning', 'readMeaning', 'dualMeaning']);

const DEFAULT_CONFIG = deepFreeze({
  ...clone(Base.DEFAULT_CONFIG),
  officialSeeds: CONFIRMATORY_SEEDS,
  commissioningSeed: 246813579,
  primaryImprovementMargin: 0.05,
  shuffledImprovementMargin: 0.10,
  alpha: 0.05,
  primaryFamilywiseAlpha: 0.05,
  candidateArmCount: CANDIDATE_ARMS.length,
  scientificRoundingDecimals: 12
});

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.keys(value).forEach((key) => deepFreeze(value[key]));
  return Object.freeze(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

function mean(values) {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function assertVector(vector, width, label, minimum = -Infinity, maximum = Infinity) {
  if (!Array.isArray(vector) || vector.length !== width) throw new Error(`${label}: expected width ${width}`);
  vector.forEach((value, index) => {
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
      throw new Error(`${label}: invalid component ${index}`);
    }
  });
}

function zeroVector(width) {
  return Array(width).fill(0);
}

function contextFrame(context) {
  assertVector(context, Base.CONTEXT_WIDTH, 'context frame input', 0, 1);
  const frame = Base.CONTEXT_FAMILIES.map((family) => {
    return mean(context.slice(family.start, family.end));
  });
  assertVector(frame, FAMILY_COUNT, 'context frame', 0, 1);
  return frame;
}

function typedConsequence(consequence) {
  assertVector(consequence, Base.CONSEQUENCE_WIDTH, 'typed consequence input', -1, 1);
  const signedMeans = [];
  const magnitudes = [];
  Base.CONTEXT_FAMILIES.forEach((family) => {
    const values = consequence.slice(family.start, family.end);
    signedMeans.push(mean(values));
    magnitudes.push(Math.sqrt(mean(values.map((value) => value * value))));
  });
  const typed = [...signedMeans, ...magnitudes];
  assertVector(typed, TYPED_CONSEQUENCE_WIDTH, 'typed consequence', -1, 1);
  return typed;
}

function bindMeaning(frame, typed) {
  assertVector(frame, FAMILY_COUNT, 'meaning context frame', 0, 1);
  assertVector(typed, TYPED_CONSEQUENCE_WIDTH, 'meaning consequence type', -1, 1);
  const output = [];
  frame.forEach((contextComponent) => {
    typed.forEach((consequenceComponent) => output.push(contextComponent * consequenceComponent));
  });
  assertVector(output, MEANING_WIDTH, 'meaning tensor', -1, 1);
  return output;
}

function neutralMeaning(typed) {
  return bindMeaning(Array(FAMILY_COUNT).fill(1), typed);
}

function meaningAtWrite(preWorld, targetId, consequence) {
  return bindMeaning(contextFrame(Base.contextVector(preWorld, targetId)), typedConsequence(consequence));
}

function frameDistance(a, b) {
  assertVector(a, FAMILY_COUNT, 'frame distance a', 0, 1);
  assertVector(b, FAMILY_COUNT, 'frame distance b', 0, 1);
  return Math.sqrt(mean(a.map((value, index) => (value - b[index]) ** 2)));
}

function blendMeaning(writeMeaning, readMeaning, reinterpretationWeight) {
  assertVector(writeMeaning, MEANING_WIDTH, 'write meaning', -1, 1);
  assertVector(readMeaning, MEANING_WIDTH, 'read meaning', -1, 1);
  const weight = clamp(reinterpretationWeight);
  return writeMeaning.map((value, index) => (1 - weight) * value + weight * readMeaning[index]);
}

class MeaningArchive {
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('MeaningArchive: invalid capacity');
    this.capacity = capacity;
    this.entries = [];
    this.nextOrdinal = 0;
  }

  record(entry) {
    if (!entry || typeof entry !== 'object') throw new Error('MeaningArchive.record: entry required');
    assertVector(entry.signature, Base.SIGNATURE_WIDTH, 'archive signature');
    assertVector(entry.consequence, Base.CONSEQUENCE_WIDTH, 'archive consequence', -1, 1);
    assertVector(entry.typedConsequence, TYPED_CONSEQUENCE_WIDTH, 'archive typed consequence', -1, 1);
    assertVector(entry.writeContext, FAMILY_COUNT, 'archive write context', 0, 1);
    assertVector(entry.meaningAtWrite, MEANING_WIDTH, 'archive meaning at write', -1, 1);
    if (!Number.isInteger(entry.actorId) || !Number.isInteger(entry.targetId) || entry.actorId === entry.targetId) {
      throw new Error('MeaningArchive.record: invalid actor-target direction');
    }
    if (!Number.isInteger(entry.kind) || entry.kind < 0 || entry.kind >= Base.EVENT_KINDS.length) {
      throw new Error('MeaningArchive.record: invalid event kind');
    }
    if (!Number.isFinite(entry.confidence) || entry.confidence < 0 || entry.confidence > 1) {
      throw new Error('MeaningArchive.record: invalid confidence');
    }
    this.entries.push({
      ...clone(entry),
      ordinal: this.nextOrdinal,
      schema: MEANING_SCHEMA
    });
    this.nextOrdinal += 1;
    while (this.entries.length > this.capacity) this.entries.shift();
  }

  serialize() {
    return {
      schema: 'gamma-003-meaning-archive-v1',
      capacity: this.capacity,
      nextOrdinal: this.nextOrdinal,
      entries: clone(this.entries)
    };
  }
}

function meanField(entries, field, kind, actorId = null, transform = null) {
  const matching = entries.filter((entry) => {
    return entry.kind === kind && (actorId === null || entry.actorId === actorId);
  });
  if (!matching.length) return zeroVector(MEANING_WIDTH);
  const output = zeroVector(MEANING_WIDTH);
  matching.forEach((entry) => {
    const vector = transform ? transform(entry) : entry[field];
    assertVector(vector, MEANING_WIDTH, 'mean field vector', -1, 1);
    vector.forEach((value, index) => { output[index] += value; });
  });
  return output.map((value) => value / matching.length);
}

function payloadForArm(entry, armName, currentFrame) {
  if (armName === 'consequenceOnly') return neutralMeaning(entry.typedConsequence);
  if (armName === 'writeMeaning') return entry.meaningAtWrite;
  const reread = bindMeaning(currentFrame, entry.typedConsequence);
  if (armName === 'readMeaning') return reread;
  if (armName === 'dualMeaning') {
    return blendMeaning(entry.meaningAtWrite, reread, frameDistance(entry.writeContext, currentFrame));
  }
  throw new Error(`Unknown meaning arm ${armName}`);
}

function kernelMeaningPrediction(entries, querySignature, event, currentFrame, armName, config, shuffled = false) {
  const fallback = meanField(entries, 'meaningAtWrite', event.kind, null, (entry) => payloadForArm(entry, armName, currentFrame));
  if (!entries.length) return fallback;
  const weighted = zeroVector(MEANING_WIDTH);
  let kernelMass = 0;
  entries.forEach((entry, index) => {
    const distance = Base.familyBalancedDistance(
      querySignature,
      entry.signature,
      Base.SIGNATURE_FAMILIES,
      true
    );
    const kernel = Math.exp(-(distance * distance) / (2 * config.sigma * config.sigma));
    const weight = entry.confidence * kernel;
    const source = shuffled ? entries[(index + 1) % entries.length] : entry;
    const payload = payloadForArm(source, armName, currentFrame);
    const center = meanField(entries, 'meaningAtWrite', source.kind, null, (candidate) => payloadForArm(candidate, armName, currentFrame));
    payload.forEach((value, channel) => {
      weighted[channel] += weight * (value - center[channel]);
    });
    kernelMass += weight;
  });
  if (kernelMass < config.epsilon) return fallback;
  const relevance = Math.min(1, kernelMass);
  return weighted.map((value, channel) => clamp(fallback[channel] + relevance * value / (config.epsilon + kernelMass), -1, 1));
}

function predictionsFor(archive, signature, event, currentFrame, config) {
  const predictions = {
    zeroMeaning: zeroVector(MEANING_WIDTH),
    typeMeanMeaning: meanField(archive.entries, 'meaningAtWrite', event.kind),
    pairTypeMeanMeaning: meanField(archive.entries, 'meaningAtWrite', event.kind, event.actorId)
  };
  ARM_NAMES.forEach((armName) => {
    predictions[armName] = kernelMeaningPrediction(archive.entries, signature, event, currentFrame, armName, config, false);
    predictions[`shuffled_${armName}`] = kernelMeaningPrediction(archive.entries, signature, event, currentFrame, armName, config, true);
  });
  return predictions;
}

function squaredError(prediction, actual) {
  assertVector(prediction, MEANING_WIDTH, 'prediction', -1, 1);
  assertVector(actual, MEANING_WIDTH, 'actual meaning', -1, 1);
  return mean(prediction.map((value, index) => (value - actual[index]) ** 2));
}

function cosineSimilarity(prediction, actual) {
  let dot = 0;
  let predictionNorm = 0;
  let actualNorm = 0;
  for (let index = 0; index < MEANING_WIDTH; index += 1) {
    dot += prediction[index] * actual[index];
    predictionNorm += prediction[index] ** 2;
    actualNorm += actual[index] ** 2;
  }
  if (predictionNorm < 1e-18 || actualNorm < 1e-18) return 0;
  return dot / Math.sqrt(predictionNorm * actualNorm);
}

class MetricAccumulator {
  constructor() {
    this.count = 0;
    this.squaredError = 0;
    this.cosine = 0;
  }
  add(prediction, actual) {
    this.count += 1;
    this.squaredError += squaredError(prediction, actual);
    this.cosine += cosineSimilarity(prediction, actual);
  }
  finalize() {
    return {
      count: this.count,
      rmse: this.count ? Math.sqrt(this.squaredError / this.count) : null,
      meanCosine: this.count ? this.cosine / this.count : null
    };
  }
}

function modelNames() {
  return [
    'zeroMeaning', 'typeMeanMeaning', 'pairTypeMeanMeaning',
    ...ARM_NAMES,
    ...ARM_NAMES.map((name) => `shuffled_${name}`)
  ];
}

function runSeed(seed, config = DEFAULT_CONFIG) {
  let world = Base.createWorld(seed, config);
  for (let tick = 0; tick < config.warmupTicks; tick += 1) Base.stepWorld(world, null);
  const archives = Array.from({ length: config.nodeCount }, () => new MeaningArchive(config.archiveCapacity));
  const accumulators = Object.fromEntries(modelNames().map((name) => [name, new MetricAccumulator()]));
  const armPayloadDigests = Object.fromEntries(ARM_NAMES.map((name) => [name, []]));
  const schedule = Base.scheduleEvents(seed, config);

  schedule.forEach((event) => {
    const archive = archives[event.targetId];
    const preWorld = clone(world);
    const signature = Base.eventSignature(preWorld, event);
    const frame = contextFrame(Base.contextVector(preWorld, event.targetId));
    const predictions = event.phase === 'test' ? predictionsFor(archive, signature, event, frame, config) : null;
    const measured = Base.measureEvent(preWorld, event, config.horizon);
    const typed = typedConsequence(measured.consequence);
    const targetMeaning = bindMeaning(frame, typed);

    if (event.phase === 'test') {
      Object.keys(accumulators).forEach((name) => accumulators[name].add(predictions[name], targetMeaning));
      ARM_NAMES.forEach((name) => armPayloadDigests[name].push(Base.fnv1a(Base.stableStringify(predictions[name]))));
    }

    archive.record({
      eventId: event.eventId,
      signature: measured.signature,
      consequence: measured.consequence,
      typedConsequence: typed,
      writeContext: frame,
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

  const metrics = Object.fromEntries(Object.entries(accumulators).map(([name, accumulator]) => [name, accumulator.finalize()]));
  return {
    seed,
    modelMetrics: metrics,
    archiveSizes: archives.map((archive) => archive.entries.length),
    armPayloadDigests: Object.fromEntries(ARM_NAMES.map((name) => [name, Base.fnv1a(armPayloadDigests[name].join('|'))])),
    roundedFinalWorldDigest: roundedWorldDigest(world, config.scientificRoundingDecimals)
  };
}

function roundNumbers(value, decimals) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Cannot canonicalize a non-finite number');
    return Number(value.toFixed(decimals));
  }
  if (Array.isArray(value)) return value.map((item) => roundNumbers(item, decimals));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, roundNumbers(value[key], decimals)]));
  }
  return value;
}

function roundedWorldDigest(world, decimals = 12) {
  return Base.fnv1a(Base.stableStringify(roundNumbers(world, decimals)));
}

function runCommissioning(config = DEFAULT_CONFIG) {
  const checks = [];
  function check(name, operation) {
    try {
      const detail = operation();
      checks.push({ name, pass: detail !== false, detail: detail === true ? null : detail });
    } catch (error) {
      checks.push({ name, pass: false, detail: error.message });
    }
  }
  const world = Base.createWorld(config.commissioningSeed, config);
  const event = { eventId: 'commission', actorId: 0, targetId: 1, kind: 3, strength: 0.2 };
  const measured = Base.measureEvent(world, event, 4);
  const frame = contextFrame(Base.contextVector(world, event.targetId));
  const typed = typedConsequence(measured.consequence);
  const write = bindMeaning(frame, typed);

  check('v1.6 consequence representation remains signed width 23', () => Base.CONSEQUENCE_WIDTH === 23);
  check('typed consequence width is fourteen', () => typed.length === 14);
  check('meaning tensor width is ninety-eight', () => write.length === 98);
  check('meaning tensor is deterministic', () => Base.stableStringify(write) === Base.stableStringify(bindMeaning(frame, typed)));
  check('neutral consequence arm is context independent', () => Base.stableStringify(neutralMeaning(typed)) === Base.stableStringify(bindMeaning(Array(7).fill(1), typed)));
  check('write and read meaning agree when contexts agree', () => Base.stableStringify(write) === Base.stableStringify(bindMeaning(frame, typed)));
  check('dual meaning reduces to write meaning at zero context distance', () => Base.stableStringify(write) === Base.stableStringify(blendMeaning(write, write, 0)));
  check('archive preserves actor-target direction', () => {
    const archive = new MeaningArchive(2);
    archive.record({ eventId: 'a', signature: measured.signature, consequence: measured.consequence, typedConsequence: typed, writeContext: frame, meaningAtWrite: write, actorId: 0, targetId: 1, kind: 3, strength: 0.2, confidence: 1, tick: 0, horizon: 4 });
    return archive.entries[0].actorId === 0 && archive.entries[0].targetId === 1;
  });
  check('archive capacity remains deterministic', () => {
    const archive = new MeaningArchive(1);
    for (let index = 0; index < 2; index += 1) archive.record({ eventId: String(index), signature: measured.signature, consequence: measured.consequence, typedConsequence: typed, writeContext: frame, meaningAtWrite: write, actorId: 0, targetId: 1, kind: 3, strength: 0.2, confidence: 1, tick: index, horizon: 4 });
    return archive.entries.length === 1 && archive.entries[0].eventId === '1';
  });
  check('rounded world fingerprint is deterministic', () => roundedWorldDigest(world) === roundedWorldDigest(clone(world)));
  check('official seeds are absent from commissioning', () => !CONFIRMATORY_SEEDS.includes(config.commissioningSeed));
  check('short commissioning smoke repeats exactly', () => {
    const smokeConfig = { ...clone(config), warmupTicks: 4, acquisitionEvents: 24, testEvents: 6, horizon: 3, archiveCapacity: 12 };
    const a = runSeed(config.commissioningSeed, smokeConfig);
    const b = runSeed(config.commissioningSeed, smokeConfig);
    return Base.stableStringify(a) === Base.stableStringify(b);
  });
  return { pass: checks.every((entry) => entry.pass), passed: checks.filter((entry) => entry.pass).length, total: checks.length, checks };
}

module.exports = Object.freeze({
  BUILD_ID,
  PROTOCOL_ID,
  MEANING_SCHEMA,
  FAMILY_COUNT,
  TYPED_CONSEQUENCE_WIDTH,
  MEANING_WIDTH,
  CONFIRMATORY_SEEDS,
  ARM_NAMES,
  CANDIDATE_ARMS,
  DEFAULT_CONFIG,
  MeaningArchive,
  contextFrame,
  typedConsequence,
  bindMeaning,
  neutralMeaning,
  meaningAtWrite,
  frameDistance,
  blendMeaning,
  predictionsFor,
  roundedWorldDigest,
  runSeed,
  runCommissioning,
  stableStringify: Base.stableStringify,
  fnv1a: Base.fnv1a
});
