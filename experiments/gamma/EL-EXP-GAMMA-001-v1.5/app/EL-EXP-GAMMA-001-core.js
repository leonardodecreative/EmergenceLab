'use strict';

(function exposeGammaExperiment(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.GammaExperiment = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildGammaExperiment() {
  const BUILD_ID = 'EL-EXP-GAMMA-001-v1.5.0';
  const PROTOCOL_ID = 'prospective-consequential-history-qualification';

  const NODE_STATE_WIDTH = 17;
  const CONTEXT_WIDTH = 23;
  const ACTOR_WIDTH = NODE_STATE_WIDTH;
  const DYAD_WIDTH = 2;
  const EVENT_WIDTH = 7;
  const SIGNATURE_WIDTH = CONTEXT_WIDTH + ACTOR_WIDTH + DYAD_WIDTH + EVENT_WIDTH;
  const CONSEQUENCE_WIDTH = CONTEXT_WIDTH;

  const EVENT_KINDS = Object.freeze([
    'SUPPORT_MEMORY',
    'ERODE_MEMORY',
    'ALIGN_THETA',
    'DISRUPT_PHASE',
    'INTEGRATION_PULSE',
    'RECOVERY_SHOCK'
  ]);

  const CONTEXT_CHANNELS = Object.freeze([
    'X', 'Y',
    'Z1.recovery.0', 'Z1.recovery.1', 'Z1.active',
    'Z2.integration.0', 'Z2.integration.1',
    'Theta.frequency.0', 'Theta.frequency.1', 'Theta.frequency.2',
    'Theta.phase.0', 'Theta.phase.1', 'Theta.phase.2',
    'Theta.amplitude.0', 'Theta.amplitude.1', 'Theta.amplitude.2',
    'Theta.coherence',
    'Relation.resonance', 'Relation.memory', 'Relation.recovery',
    'Relation.integration', 'Relation.thetaAlignment',
    'Environment'
  ]);

  const CONTEXT_FAMILIES = Object.freeze([
    Object.freeze({ name: 'X', start: 0, end: 1 }),
    Object.freeze({ name: 'Y', start: 1, end: 2 }),
    Object.freeze({ name: 'Z1', start: 2, end: 5 }),
    Object.freeze({ name: 'Z2', start: 5, end: 7 }),
    Object.freeze({ name: 'Theta', start: 7, end: 17 }),
    Object.freeze({ name: 'Relation', start: 17, end: 22 }),
    Object.freeze({ name: 'Environment', start: 22, end: 23 })
  ]);

  const ACTOR_OFFSET = CONTEXT_WIDTH;
  const DYAD_OFFSET = ACTOR_OFFSET + ACTOR_WIDTH;
  const EVENT_OFFSET = DYAD_OFFSET + DYAD_WIDTH;

  const SIGNATURE_FAMILIES = Object.freeze([
    ...CONTEXT_FAMILIES,
    Object.freeze({ name: 'Actor.X', start: ACTOR_OFFSET, end: ACTOR_OFFSET + 1 }),
    Object.freeze({ name: 'Actor.Y', start: ACTOR_OFFSET + 1, end: ACTOR_OFFSET + 2 }),
    Object.freeze({ name: 'Actor.Z1', start: ACTOR_OFFSET + 2, end: ACTOR_OFFSET + 5 }),
    Object.freeze({ name: 'Actor.Z2', start: ACTOR_OFFSET + 5, end: ACTOR_OFFSET + 7 }),
    Object.freeze({ name: 'Actor.Theta', start: ACTOR_OFFSET + 7, end: ACTOR_OFFSET + 17 }),
    Object.freeze({ name: 'Dyad', start: DYAD_OFFSET, end: EVENT_OFFSET }),
    Object.freeze({ name: 'Event', start: EVENT_OFFSET, end: SIGNATURE_WIDTH })
  ]);

  const DEFAULT_CONFIG = deepFreeze({
    nodeCount: 6,
    warmupTicks: 30,
    horizon: 10,
    acquisitionEvents: 360,
    testEvents: 180,
    archiveCapacity: 48,
    sigma: 0.015,
    epsilon: 1e-9,
    recencyWindow: 8,
    primaryImprovementMargin: 0.05,
    shuffledImprovementMargin: 0.10,
    requiredPassingSeeds: 4,
    minimumMeanConsequenceMagnitude: 0.0001,
    officialSeeds: [5, 18, 103, 449, 871],
    commissioningSeed: 13579,
    strengthLevels: [0.12, 0.20, 0.28]
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
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  function assertFiniteVector(value, width, label, minimum = -Infinity, maximum = Infinity) {
    if (!Array.isArray(value) || value.length !== width) {
      throw new Error(`${label}: expected width ${width}`);
    }
    value.forEach((component, index) => {
      if (!Number.isFinite(component) || component < minimum || component > maximum) {
        throw new Error(`${label}: invalid component at ${index}`);
      }
    });
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (value && typeof value === 'object') {
      return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value);
  }

  function fnv1a(text) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function mulberry32(seed) {
    let state = seed >>> 0;
    return function random() {
      state = (state + 0x6D2B79F5) >>> 0;
      let temporary = state;
      temporary = Math.imul(temporary ^ (temporary >>> 15), temporary | 1);
      temporary ^= temporary + Math.imul(temporary ^ (temporary >>> 7), temporary | 61);
      return ((temporary ^ (temporary >>> 14)) >>> 0) / 4294967296;
    };
  }

  function deterministicUnit(seed, tick, nodeId, salt) {
    let value = (seed ^ Math.imul(tick + 1, 0x9E3779B1) ^ Math.imul(nodeId + 17, 0x85EBCA6B) ^ Math.imul(salt + 31, 0xC2B2AE35)) >>> 0;
    value ^= value >>> 16;
    value = Math.imul(value, 0x7FEB352D);
    value ^= value >>> 15;
    value = Math.imul(value, 0x846CA68B);
    value ^= value >>> 16;
    return (value >>> 0) / 4294967296;
  }

  function circularDistance(a, b) {
    const direct = Math.abs(a - b);
    return Math.min(direct, 1 - direct);
  }

  function componentSimilarity(a, b) {
    const width = Math.min(a.length, b.length);
    if (!width) return 0;
    let distance = 0;
    for (let index = 0; index < width; index += 1) distance += Math.abs(a[index] - b[index]);
    return clamp(1 - distance / width);
  }

  function thetaSimilarity(a, b) {
    const frequency = componentSimilarity(a.theta.frequency, b.theta.frequency);
    const phase = componentSimilarity(a.theta.phase, b.theta.phase);
    const amplitude = componentSimilarity(a.theta.amplitude, b.theta.amplitude);
    const coherence = 1 - Math.abs(a.theta.coherence - b.theta.coherence);
    return clamp(0.30 * frequency + 0.25 * phase + 0.25 * amplitude + 0.20 * coherence);
  }

  function createNode(id, random) {
    return {
      id,
      position: (id + 0.05 * random()) / DEFAULT_CONFIG.nodeCount,
      X: 0.28 + 0.32 * random(),
      Y: 0.12 + 0.26 * random(),
      Z1: {
        recovery: [0.35 + 0.30 * random(), 0.35 + 0.30 * random()],
        active: false
      },
      Z2: {
        integration: [0.38 + 0.28 * random(), 0.38 + 0.28 * random()]
      },
      theta: {
        frequency: [0.25 + 0.50 * random(), 0.25 + 0.50 * random(), 0.25 + 0.50 * random()],
        phase: [random(), random(), random()],
        amplitude: [0.22 + 0.35 * random(), 0.18 + 0.30 * random(), 0.14 + 0.26 * random()],
        coherence: 0.35 + 0.30 * random()
      }
    };
  }

  function createWorld(seed, config = DEFAULT_CONFIG) {
    const random = mulberry32(seed);
    const nodes = [];
    for (let index = 0; index < config.nodeCount; index += 1) {
      const node = createNode(index, random);
      node.position = (index + 0.15 * random()) / config.nodeCount;
      nodes.push(node);
    }
    return { seed, tick: 0, nodes };
  }

  function environmentAt(world, nodeIndex) {
    const node = world.nodes[nodeIndex];
    const wave = 0.50 + 0.18 * Math.sin(world.tick * 0.071 + node.position * Math.PI * 4) +
      0.12 * Math.cos(world.tick * 0.043 - node.position * Math.PI * 6);
    const noise = (deterministicUnit(world.seed, world.tick, node.id, 11) - 0.5) * 0.08;
    return clamp(wave + noise);
  }

  function calculateNeighborInfluence(world, nodeIndex) {
    const target = world.nodes[nodeIndex];
    let totalWeight = 0;
    let resonance = 0;
    let memory = 0;
    let recovery = 0;
    let integration = 0;
    let thetaAlignment = 0;
    const frequency = [0, 0, 0];
    const phase = [0, 0, 0];
    const amplitude = [0, 0, 0];

    world.nodes.forEach((source, sourceIndex) => {
      if (sourceIndex === nodeIndex) return;
      const distance = circularDistance(target.position, source.position);
      const proximity = Math.exp(-(distance * distance) / (2 * 0.23 * 0.23));
      const similarity = thetaSimilarity(target, source);
      const weight = proximity * (0.25 + 0.75 * similarity);
      totalWeight += weight;
      resonance += weight * similarity;
      memory += weight * source.Y;
      recovery += weight * mean(source.Z1.recovery);
      integration += weight * mean(source.Z2.integration);
      thetaAlignment += weight * similarity;
      for (let component = 0; component < 3; component += 1) {
        frequency[component] += weight * source.theta.frequency[component];
        phase[component] += weight * source.theta.phase[component];
        amplitude[component] += weight * source.theta.amplitude[component];
      }
    });

    if (totalWeight <= 1e-12) {
      return {
        resonance: 0,
        memory: 0,
        recovery: 0,
        integration: 0,
        thetaAlignment: 0,
        frequency: target.theta.frequency.slice(),
        phase: target.theta.phase.slice(),
        amplitude: target.theta.amplitude.slice()
      };
    }

    return {
      resonance: clamp(resonance / totalWeight),
      memory: clamp(memory / totalWeight),
      recovery: clamp(recovery / totalWeight),
      integration: clamp(integration / totalWeight),
      thetaAlignment: clamp(thetaAlignment / totalWeight),
      frequency: frequency.map((value) => clamp(value / totalWeight)),
      phase: phase.map((value) => clamp(value / totalWeight)),
      amplitude: amplitude.map((value) => clamp(value / totalWeight))
    };
  }

  function eventInput(world, nodeIndex, event) {
    const zero = {
      X: 0,
      Y: 0,
      Z1: [0, 0],
      Z2: [0, 0],
      frequency: [0, 0, 0],
      phase: [0, 0, 0],
      amplitude: [0, 0, 0],
      coherence: 0,
      activateRecovery: false
    };
    if (!event || event.targetId !== nodeIndex || event.strength === 0) return zero;

    const strength = event.strength;
    const target = world.nodes[nodeIndex];
    const actor = world.nodes[event.actorId];
    const alignment = thetaSimilarity(actor, target);
    const actorRecovery = mean(actor.Z1.recovery);
    const actorIntegration = mean(actor.Z2.integration);
    const targetRecovery = mean(target.Z1.recovery);
    const targetIntegration = mean(target.Z2.integration);
    let gain;
    switch (event.kind) {
      case 0:
        gain = strength * (0.20 + 0.80 * alignment) * (0.25 + 0.75 * actor.Y) * (1 - 0.70 * target.Y);
        zero.Y += 0.72 * gain;
        zero.Z2[0] += 0.22 * gain * (1 - targetIntegration);
        zero.amplitude[0] += 0.14 * gain;
        break;
      case 1:
        gain = strength * (0.25 + 0.75 * (1 - alignment)) * (0.30 + 0.70 * target.Y) * (0.35 + 0.65 * (1 - actor.Y));
        zero.Y -= 0.66 * gain;
        zero.Z1[0] += 0.30 * gain * (1 - targetRecovery);
        zero.coherence -= 0.18 * gain;
        zero.activateRecovery = true;
        break;
      case 2:
        gain = strength * (0.30 + 0.70 * actor.theta.coherence) * (0.35 + 0.65 * (1 - alignment));
        for (let component = 0; component < 3; component += 1) {
          zero.frequency[component] += (actor.theta.frequency[component] - target.theta.frequency[component]) * 0.78 * gain;
          zero.phase[component] += (actor.theta.phase[component] - target.theta.phase[component]) * 0.78 * gain;
        }
        zero.coherence += 0.42 * gain * (1 - target.theta.coherence);
        break;
      case 3:
        gain = strength * (0.25 + 0.75 * actor.theta.coherence) * (0.25 + 0.75 * target.theta.coherence);
        zero.phase[0] += 0.62 * gain;
        zero.phase[1] -= 0.54 * gain;
        zero.phase[2] += 0.44 * gain;
        zero.coherence -= 0.56 * gain;
        zero.Z1[1] += 0.24 * gain * (1 - targetRecovery);
        zero.activateRecovery = true;
        break;
      case 4:
        gain = strength * (0.20 + 0.80 * actorIntegration) * (0.20 + 0.80 * alignment) * (1 - 0.75 * targetIntegration);
        zero.Z2[0] += 0.62 * gain;
        zero.Z2[1] += 0.48 * gain;
        zero.Y += 0.24 * gain;
        zero.X += 0.10 * gain * (1 - target.X);
        break;
      case 5:
        gain = strength * (0.30 + 0.70 * (1 - actorRecovery)) * (0.25 + 0.75 * (0.5 * target.X + 0.5 * target.theta.coherence));
        zero.X -= 0.48 * gain;
        zero.Y -= 0.30 * gain;
        zero.Z1[0] += 0.68 * gain * (1 - target.Z1.recovery[0]);
        zero.Z1[1] += 0.58 * gain * (1 - target.Z1.recovery[1]);
        zero.coherence -= 0.30 * gain;
        zero.activateRecovery = true;
        break;
      default:
        throw new Error(`Unknown event kind ${event.kind}`);
    }
    return zero;
  }

  function stepWorld(world, event = null) {
    const previous = clone(world);
    const influences = previous.nodes.map((node, index) => calculateNeighborInfluence(previous, index));
    const nextNodes = previous.nodes.map((node, index) => {
      const influence = influences[index];
      const environment = environmentAt(previous, index);
      const input = eventInput(previous, index, event);
      const mismatch = 1 - influence.thetaAlignment;
      const randomDrift = (deterministicUnit(previous.seed, previous.tick, node.id, 29) - 0.5) * 0.004;

      const nextY = clamp(node.Y + 0.024 * (environment - node.Y) + 0.030 * (influence.memory - node.Y) + input.Y + randomDrift);
      const nextZ1 = node.Z1.recovery.map((value, component) => clamp(
        value + 0.022 * (mismatch - value) - 0.010 * influence.recovery + input.Z1[component]
      ));
      const nextZ2 = node.Z2.integration.map((value, component) => clamp(
        value + 0.026 * (influence.integration * influence.thetaAlignment - value) +
        0.008 * nextY + input.Z2[component]
      ));

      const frequency = node.theta.frequency.map((value, component) => clamp(
        value + 0.018 * (influence.frequency[component] - value) + input.frequency[component]
      ));
      const phase = node.theta.phase.map((value, component) => clamp(
        value + 0.020 * (influence.phase[component] - value) + input.phase[component]
      ));
      const amplitude = node.theta.amplitude.map((value, component) => clamp(
        value + 0.018 * (influence.amplitude[component] - value) +
        0.006 * environment + input.amplitude[component]
      ));
      const phaseSpread = Math.max(...phase) - Math.min(...phase);
      const coherenceTarget = clamp(0.45 * influence.thetaAlignment + 0.35 * mean(amplitude) + 0.20 * (1 - phaseSpread));
      const coherence = clamp(node.theta.coherence + 0.035 * (coherenceTarget - node.theta.coherence) + input.coherence);
      const integrationDrive = mean(nextZ2) * coherence;
      const recoilCost = mean(nextZ1) * mismatch;
      const nextX = clamp(node.X + 0.010 * integrationDrive - 0.007 * recoilCost + input.X);

      return {
        id: node.id,
        position: node.position,
        X: nextX,
        Y: nextY,
        Z1: {
          recovery: nextZ1,
          active: input.activateRecovery || mean(nextZ1) > 0.58
        },
        Z2: { integration: nextZ2 },
        theta: { frequency, phase, amplitude, coherence }
      };
    });

    world.tick = previous.tick + 1;
    world.nodes = nextNodes;
    return world;
  }

  function nodeStateVector(node) {
    const vector = [
      node.X,
      node.Y,
      node.Z1.recovery[0],
      node.Z1.recovery[1],
      node.Z1.active ? 1 : 0,
      node.Z2.integration[0],
      node.Z2.integration[1],
      ...node.theta.frequency,
      ...node.theta.phase,
      ...node.theta.amplitude,
      node.theta.coherence
    ];
    assertFiniteVector(vector, NODE_STATE_WIDTH, 'node state vector');
    return vector;
  }

  function contextVector(world, targetId) {
    const node = world.nodes[targetId];
    const influence = calculateNeighborInfluence(world, targetId);
    const vector = [
      ...nodeStateVector(node),
      influence.resonance,
      influence.memory,
      influence.recovery,
      influence.integration,
      influence.thetaAlignment,
      environmentAt(world, targetId)
    ];
    assertFiniteVector(vector, CONTEXT_WIDTH, 'context vector');
    return vector;
  }

  function eventDescriptor(event) {
    if (!event || !Number.isInteger(event.kind) || event.kind < 0 || event.kind >= EVENT_KINDS.length) {
      throw new Error('event descriptor: invalid event');
    }
    const oneHot = EVENT_KINDS.map((value, index) => index === event.kind ? 1 : 0);
    const vector = [...oneHot, event.strength];
    assertFiniteVector(vector, EVENT_WIDTH, 'event descriptor', 0, 1);
    return vector;
  }

  function eventSignature(world, event) {
    const actor = world.nodes[event.actorId];
    const target = world.nodes[event.targetId];
    if (!actor || !target || actor.id === target.id) throw new Error('event signature: invalid actor-target pair');
    const dyad = [
      2 * circularDistance(actor.position, target.position),
      thetaSimilarity(actor, target)
    ];
    assertFiniteVector(dyad, DYAD_WIDTH, 'dyadic descriptor', 0, 1);
    const signature = [
      ...contextVector(world, event.targetId),
      ...nodeStateVector(actor),
      ...dyad,
      ...eventDescriptor(event)
    ];
    assertFiniteVector(signature, SIGNATURE_WIDTH, 'event signature');
    return signature;
  }

  function familyBalancedDistance(a, b, families) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return Infinity;
    let familyTotal = 0;
    families.forEach((family) => {
      let squared = 0;
      for (let index = family.start; index < family.end; index += 1) {
        const difference = a[index] - b[index];
        squared += difference * difference;
      }
      familyTotal += Math.sqrt(squared / Math.max(1, family.end - family.start));
    });
    return familyTotal / families.length;
  }

  function vectorMagnitude(vector) {
    assertFiniteVector(vector, CONSEQUENCE_WIDTH, 'consequence vector', -1, 1);
    let total = 0;
    CONTEXT_FAMILIES.forEach((family) => {
      let squared = 0;
      for (let index = family.start; index < family.end; index += 1) squared += vector[index] * vector[index];
      total += Math.sqrt(squared / Math.max(1, family.end - family.start));
    });
    return total / CONTEXT_FAMILIES.length;
  }

  function zeroVector() {
    return Array(CONSEQUENCE_WIDTH).fill(0);
  }

  class GammaArchive {
    constructor(capacity) {
      if (!Number.isInteger(capacity) || capacity <= 0) throw new Error('GammaArchive: invalid capacity');
      this.capacity = capacity;
      this.entries = [];
      this.nextOrdinal = 0;
    }

    record(entry) {
      if (!entry || typeof entry !== 'object') throw new Error('GammaArchive.record: entry required');
      assertFiniteVector(entry.signature, SIGNATURE_WIDTH, 'archive signature');
      assertFiniteVector(entry.consequence, CONSEQUENCE_WIDTH, 'archive consequence', -1, 1);
      if (!Number.isInteger(entry.actorId) || !Number.isInteger(entry.targetId)) throw new Error('GammaArchive.record: actor and target required');
      if (!Number.isInteger(entry.kind) || entry.kind < 0 || entry.kind >= EVENT_KINDS.length) throw new Error('GammaArchive.record: invalid kind');
      if (!Number.isFinite(entry.confidence) || entry.confidence < 0 || entry.confidence > 1) throw new Error('GammaArchive.record: invalid confidence');
      if (!Number.isFinite(entry.tick) || entry.tick < 0) throw new Error('GammaArchive.record: invalid tick');
      if (!Number.isFinite(entry.horizon) || entry.horizon < 1) throw new Error('GammaArchive.record: invalid horizon');
      this.entries.push({
        eventId: String(entry.eventId),
        signature: entry.signature.slice(),
        consequence: entry.consequence.slice(),
        actorId: entry.actorId,
        targetId: entry.targetId,
        kind: entry.kind,
        strength: entry.strength,
        confidence: entry.confidence,
        tick: entry.tick,
        horizon: entry.horizon,
        ordinal: this.nextOrdinal
      });
      this.nextOrdinal += 1;
      while (this.entries.length > this.capacity) this.entries.shift();
    }

    serialize() {
      return {
        schema: 'gamma-001-v1',
        capacity: this.capacity,
        nextOrdinal: this.nextOrdinal,
        entries: this.entries.map((entry) => clone(entry))
      };
    }
  }

  function kernelPrediction(entries, querySignature, options) {
    const sigma = options.sigma;
    const epsilon = options.epsilon;
    if (!Number.isFinite(sigma) || sigma <= 0) throw new Error('kernel prediction: invalid sigma');
    if (!Number.isFinite(epsilon) || epsilon <= 0) throw new Error('kernel prediction: invalid epsilon');
    const basePrediction = options.baselineMode === 'pair'
      ? pairTypeMeanPrediction(entries, options.actorId, options.kind)
      : options.baselineMode === 'type'
        ? typeMeanPrediction(entries, options.kind)
        : zeroVector();
    if (!entries.length) return basePrediction;

    const eligible = entries.filter((entry) => {
      if (options.actorId !== undefined && entry.actorId !== options.actorId) return false;
      return true;
    });
    if (!eligible.length) return basePrediction;

    const weighted = zeroVector();
    let kernelMass = 0;
    eligible.forEach((entry, entryIndex) => {
      const query = options.stateOnly ? querySignature.slice(0, CONTEXT_WIDTH) : querySignature;
      const stored = options.stateOnly ? entry.signature.slice(0, CONTEXT_WIDTH) : entry.signature;
      const families = options.stateOnly ? CONTEXT_FAMILIES : SIGNATURE_FAMILIES;
      const distance = familyBalancedDistance(query, stored, families);
      const kernel = Math.exp(-(distance * distance) / (2 * sigma * sigma));
      const weight = entry.confidence * kernel;
      const sourceEntry = options.shuffled
        ? eligible[(entryIndex + 1) % eligible.length]
        : entry;
      const center = options.baselineMode === 'pair'
        ? pairTypeMeanPrediction(entries, sourceEntry.actorId, sourceEntry.kind)
        : options.baselineMode === 'type'
          ? typeMeanPrediction(entries, sourceEntry.kind)
          : zeroVector();
      for (let channel = 0; channel < CONSEQUENCE_WIDTH; channel += 1) {
        weighted[channel] += weight * (sourceEntry.consequence[channel] - center[channel]);
      }
      kernelMass += weight;
    });

    if (kernelMass < epsilon) return basePrediction;
    const relevance = Math.min(1, kernelMass);
    return weighted.map((value, channel) => clamp(
      basePrediction[channel] + relevance * value / (epsilon + kernelMass),
      -1,
      1
    ));
  }

  function recencyPrediction(entries, windowSize) {
    if (!entries.length) return zeroVector();
    const recent = entries.slice(-windowSize);
    const output = zeroVector();
    recent.forEach((entry) => {
      for (let channel = 0; channel < CONSEQUENCE_WIDTH; channel += 1) output[channel] += entry.consequence[channel];
    });
    return output.map((value) => value / recent.length);
  }

  function typeMeanPrediction(entries, kind) {
    const matching = entries.filter((entry) => entry.kind === kind);
    if (!matching.length) return zeroVector();
    const output = zeroVector();
    matching.forEach((entry) => {
      for (let channel = 0; channel < CONSEQUENCE_WIDTH; channel += 1) output[channel] += entry.consequence[channel];
    });
    return output.map((value) => value / matching.length);
  }

  function pairTypeMeanPrediction(entries, actorId, kind) {
    const matching = entries.filter((entry) => entry.actorId === actorId && entry.kind === kind);
    if (!matching.length) return zeroVector();
    const output = zeroVector();
    matching.forEach((entry) => {
      for (let channel = 0; channel < CONSEQUENCE_WIDTH; channel += 1) output[channel] += entry.consequence[channel];
    });
    return output.map((value) => value / matching.length);
  }

  function predictionsFor(archive, signature, event, config) {
    const entries = archive.entries;
    return {
      zero: zeroVector(),
      recency: recencyPrediction(entries, config.recencyWindow),
      typeMean: typeMeanPrediction(entries, event.kind),
      pairTypeMean: pairTypeMeanPrediction(entries, event.actorId, event.kind),
      stateKernel: kernelPrediction(entries, signature, {
        sigma: config.sigma,
        epsilon: config.epsilon,
        stateOnly: true
      }),
      shuffledGammaRelational: kernelPrediction(entries, signature, {
        sigma: config.sigma,
        epsilon: config.epsilon,
        kind: event.kind,
        baselineMode: 'type',
        shuffled: true
      }),
      gammaRelational: kernelPrediction(entries, signature, {
        sigma: config.sigma,
        epsilon: config.epsilon,
        kind: event.kind,
        baselineMode: 'type'
      }),
      shuffledGammaDyadic: kernelPrediction(entries, signature, {
        sigma: config.sigma,
        epsilon: config.epsilon,
        actorId: event.actorId,
        kind: event.kind,
        baselineMode: 'pair',
        shuffled: true
      }),
      gammaDyadic: kernelPrediction(entries, signature, {
        sigma: config.sigma,
        epsilon: config.epsilon,
        actorId: event.actorId,
        kind: event.kind,
        baselineMode: 'pair'
      })
    };
  }

  function measureEvent(preWorld, event, horizon) {
    if (!Number.isInteger(horizon) || horizon < 1) throw new Error('measureEvent: horizon must be positive integer');
    const immutableDigest = fnv1a(stableStringify(preWorld));
    const signature = eventSignature(preWorld, event);
    const factual = clone(preWorld);
    const counterfactual = clone(preWorld);

    stepWorld(factual, event);
    stepWorld(counterfactual, null);
    for (let offset = 1; offset < horizon; offset += 1) {
      stepWorld(factual, null);
      stepWorld(counterfactual, null);
    }

    const factualOutcome = contextVector(factual, event.targetId);
    const counterfactualOutcome = contextVector(counterfactual, event.targetId);
    const consequence = factualOutcome.map((value, index) => clamp(value - counterfactualOutcome[index], -1, 1));
    assertFiniteVector(consequence, CONSEQUENCE_WIDTH, 'measured consequence', -1, 1);
    if (fnv1a(stableStringify(preWorld)) !== immutableDigest) throw new Error('measureEvent mutated its input world');

    return { signature, consequence, factual, counterfactual };
  }

  function shuffle(values, random) {
    const output = values.slice();
    for (let index = output.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      const temporary = output[index];
      output[index] = output[swapIndex];
      output[swapIndex] = temporary;
    }
    return output;
  }

  function completeEventBlock(config) {
    const events = [];
    for (let actorId = 0; actorId < config.nodeCount; actorId += 1) {
      for (let targetId = 0; targetId < config.nodeCount; targetId += 1) {
        if (actorId === targetId) continue;
        for (let kind = 0; kind < EVENT_KINDS.length; kind += 1) {
          events.push({ actorId, targetId, kind });
        }
      }
    }
    return events;
  }

  function scheduleEvents(seed, config) {
    const random = mulberry32(seed ^ 0xA53C9E1D);
    const block = completeEventBlock(config);
    const makeEvents = (count, phase, phaseIndex) => {
      const events = [];
      let cycle = 0;
      while (events.length < count) {
        const mixed = shuffle(block, random);
        for (const base of mixed) {
          if (events.length >= count) break;
          const strength = config.strengthLevels[Math.floor(random() * config.strengthLevels.length)];
          events.push({
            ...base,
            strength,
            phase,
            eventId: `${seed}-${phaseIndex}-${cycle}-${events.length}`
          });
        }
        cycle += 1;
      }
      return events;
    };
    return [
      ...makeEvents(config.acquisitionEvents, 'acquisition', 0),
      ...makeEvents(config.testEvents, 'test', 1)
    ];
  }

  function familySquaredError(prediction, actual) {
    let familyTotal = 0;
    CONTEXT_FAMILIES.forEach((family) => {
      let squared = 0;
      for (let index = family.start; index < family.end; index += 1) {
        const difference = prediction[index] - actual[index];
        squared += difference * difference;
      }
      familyTotal += squared / Math.max(1, family.end - family.start);
    });
    return familyTotal / CONTEXT_FAMILIES.length;
  }

  function cosineSimilarity(prediction, actual) {
    let dot = 0;
    let predictionNorm = 0;
    let actualNorm = 0;
    for (let index = 0; index < CONSEQUENCE_WIDTH; index += 1) {
      dot += prediction[index] * actual[index];
      predictionNorm += prediction[index] * prediction[index];
      actualNorm += actual[index] * actual[index];
    }
    if (predictionNorm < 1e-18 || actualNorm < 1e-18) return 0;
    return dot / Math.sqrt(predictionNorm * actualNorm);
  }

  function signAgreement(prediction, actual) {
    let correct = 0;
    let eligible = 0;
    for (let index = 0; index < CONSEQUENCE_WIDTH; index += 1) {
      if (Math.abs(actual[index]) < 1e-6) continue;
      eligible += 1;
      if (Math.sign(prediction[index]) === Math.sign(actual[index])) correct += 1;
    }
    return eligible ? correct / eligible : 0;
  }

  class MetricAccumulator {
    constructor() {
      this.count = 0;
      this.squaredError = 0;
      this.cosine = 0;
      this.sign = 0;
    }

    add(prediction, actual) {
      assertFiniteVector(prediction, CONSEQUENCE_WIDTH, 'prediction', -1, 1);
      assertFiniteVector(actual, CONSEQUENCE_WIDTH, 'actual', -1, 1);
      this.count += 1;
      this.squaredError += familySquaredError(prediction, actual);
      this.cosine += cosineSimilarity(prediction, actual);
      this.sign += signAgreement(prediction, actual);
    }

    finalize() {
      if (!this.count) return { count: 0, balancedRmse: null, meanCosine: null, meanSignAgreement: null };
      return {
        count: this.count,
        balancedRmse: Math.sqrt(this.squaredError / this.count),
        meanCosine: this.cosine / this.count,
        meanSignAgreement: this.sign / this.count
      };
    }
  }

  function makeAccumulators() {
    return {
      zero: new MetricAccumulator(),
      recency: new MetricAccumulator(),
      typeMean: new MetricAccumulator(),
      pairTypeMean: new MetricAccumulator(),
      stateKernel: new MetricAccumulator(),
      shuffledGammaRelational: new MetricAccumulator(),
      gammaRelational: new MetricAccumulator(),
      shuffledGammaDyadic: new MetricAccumulator(),
      gammaDyadic: new MetricAccumulator()
    };
  }

  function finalizeAccumulators(accumulators) {
    const output = {};
    Object.keys(accumulators).forEach((name) => {
      output[name] = accumulators[name].finalize();
    });
    return output;
  }

  function scoreSeed(modelMetrics, config) {
    const baselineNames = ['zero', 'recency', 'typeMean', 'pairTypeMean', 'stateKernel'];
    const bestBaseline = baselineNames
      .map((name) => ({ name, rmse: modelMetrics[name].balancedRmse }))
      .sort((a, b) => a.rmse - b.rmse)[0];
    const gammaRmse = modelMetrics.gammaRelational.balancedRmse;
    const shuffledRmse = modelMetrics.shuffledGammaRelational.balancedRmse;
    const baselineImprovement = bestBaseline.rmse > 0 ? (bestBaseline.rmse - gammaRmse) / bestBaseline.rmse : 0;
    const shuffledImprovement = shuffledRmse > 0 ? (shuffledRmse - gammaRmse) / shuffledRmse : 0;
    const pass = baselineImprovement >= config.primaryImprovementMargin &&
      shuffledImprovement >= config.shuffledImprovementMargin;
    return {
      bestBaseline: bestBaseline.name,
      bestBaselineRmse: bestBaseline.rmse,
      gammaRmse,
      baselineImprovement,
      shuffledImprovement,
      pass
    };
  }

  function runSeed(seed, config = DEFAULT_CONFIG, progress = null) {
    let world = createWorld(seed, config);
    for (let tick = 0; tick < config.warmupTicks; tick += 1) stepWorld(world, null);
    const archives = Array.from({ length: config.nodeCount }, () => new GammaArchive(config.archiveCapacity));
    const schedule = scheduleEvents(seed, config);
    const metrics = makeAccumulators();
    const testRecords = [];
    let consequenceMagnitudeTotal = 0;
    let consequenceCount = 0;

    schedule.forEach((event, eventIndex) => {
      const archive = archives[event.targetId];
      const signature = eventSignature(world, event);
      const predictions = event.phase === 'test' ? predictionsFor(archive, signature, event, config) : null;
      const measured = measureEvent(world, event, config.horizon);

      if (event.phase === 'test') {
        Object.keys(metrics).forEach((name) => metrics[name].add(predictions[name], measured.consequence));
        const magnitude = vectorMagnitude(measured.consequence);
        consequenceMagnitudeTotal += magnitude;
        consequenceCount += 1;
        testRecords.push({
          eventId: event.eventId,
          actorId: event.actorId,
          targetId: event.targetId,
          kind: EVENT_KINDS[event.kind],
          strength: event.strength,
          tick: world.tick,
          consequenceMagnitude: magnitude,
          gammaPredictionMagnitude: vectorMagnitude(predictions.gammaRelational)
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
      if (progress && eventIndex % 20 === 0) progress({ seed, eventIndex, eventCount: schedule.length });
    });

    const modelMetrics = finalizeAccumulators(metrics);
    const score = scoreSeed(modelMetrics, config);
    return {
      seed,
      modelMetrics,
      score,
      meanConsequenceMagnitude: consequenceCount ? consequenceMagnitudeTotal / consequenceCount : 0,
      archiveSizes: archives.map((archive) => archive.entries.length),
      finalWorldDigest: fnv1a(stableStringify(world)),
      finalWorld: world,
      testRecords
    };
  }

  function runCommissioning(config = DEFAULT_CONFIG) {
    const tests = [];
    function test(name, operation) {
      try {
        const detail = operation();
        tests.push({ name, pass: detail !== false, detail: detail === true || detail === undefined ? null : detail });
      } catch (error) {
        tests.push({ name, pass: false, detail: error.message });
      }
    }

    test('schema widths are fixed and internally consistent', () => {
      return CONTEXT_CHANNELS.length === CONTEXT_WIDTH && NODE_STATE_WIDTH === 17 &&
        ACTOR_WIDTH === NODE_STATE_WIDTH && DYAD_WIDTH === 2 &&
        EVENT_WIDTH === EVENT_KINDS.length + 1 &&
        SIGNATURE_WIDTH === CONTEXT_WIDTH + ACTOR_WIDTH + DYAD_WIDTH + EVENT_WIDTH;
    });

    test('same seed produces identical Tick-0 world', () => {
      const a = createWorld(config.commissioningSeed, config);
      const b = createWorld(config.commissioningSeed, config);
      return stableStringify(a) === stableStringify(b);
    });

    test('matched no-event branches remain identical', () => {
      const a = createWorld(config.commissioningSeed, config);
      const b = clone(a);
      for (let tick = 0; tick < 12; tick += 1) {
        stepWorld(a, null);
        stepWorld(b, null);
      }
      return stableStringify(a) === stableStringify(b);
    });

    test('zero-strength event equals suppression', () => {
      const world = createWorld(config.commissioningSeed, config);
      const event = { eventId: 'zero', actorId: 0, targetId: 1, kind: 0, strength: 0 };
      const measured = measureEvent(world, event, 4);
      return measured.consequence.every((value) => Math.abs(value) < 1e-15);
    });

    test('known support event has positive immediate Y consequence', () => {
      const world = createWorld(config.commissioningSeed, config);
      const event = { eventId: 'known-y', actorId: 0, targetId: 1, kind: 0, strength: 0.2 };
      const measured = measureEvent(world, event, 1);
      return measured.consequence[1] > 0;
    });

    test('measurement does not mutate the supplied pre-event world', () => {
      const world = createWorld(config.commissioningSeed, config);
      const before = stableStringify(world);
      measureEvent(world, { eventId: 'immutability', actorId: 0, targetId: 1, kind: 2, strength: 0.2 }, 5);
      return stableStringify(world) === before;
    });

    test('empty Gamma archive returns a zero vector', () => {
      const world = createWorld(config.commissioningSeed, config);
      const event = { eventId: 'empty', actorId: 0, targetId: 1, kind: 1, strength: 0.2 };
      const signature = eventSignature(world, event);
      const archive = new GammaArchive(4);
      return kernelPrediction(archive.entries, signature, { sigma: config.sigma, epsilon: config.epsilon })
        .every((value) => value === 0);
    });

    test('archive capacity is enforced without merging records', () => {
      const world = createWorld(config.commissioningSeed, config);
      const archive = new GammaArchive(2);
      for (let index = 0; index < 3; index += 1) {
        const event = { eventId: `cap-${index}`, actorId: 0, targetId: 1, kind: index, strength: 0.2 };
        archive.record({
          ...event,
          signature: eventSignature(world, event),
          consequence: zeroVector(),
          confidence: 1,
          tick: index,
          horizon: 1
        });
      }
      return archive.entries.length === 2 && archive.entries[0].eventId === 'cap-1';
    });

    test('test prediction is generated before current consequence is archived', () => {
      const source = runSeed(config.commissioningSeed, {
        ...config,
        acquisitionEvents: 30,
        testEvents: 1,
        horizon: 3,
        warmupTicks: 5
      });
      return source.modelMetrics.gammaRelational.count === 1 && source.archiveSizes.every((size) => size <= config.archiveCapacity);
    });

    return {
      pass: tests.every((entry) => entry.pass),
      passed: tests.filter((entry) => entry.pass).length,
      total: tests.length,
      tests
    };
  }

  function combineSeedMetrics(seedResults) {
    const modelNames = Object.keys(seedResults[0].modelMetrics);
    const output = {};
    modelNames.forEach((name) => {
      const totalCount = seedResults.reduce((sum, result) => sum + result.modelMetrics[name].count, 0);
      const pooledMse = seedResults.reduce((sum, result) => {
        const metric = result.modelMetrics[name];
        return sum + metric.count * metric.balancedRmse * metric.balancedRmse;
      }, 0) / totalCount;
      output[name] = {
        count: totalCount,
        balancedRmse: Math.sqrt(pooledMse),
        meanCosine: seedResults.reduce((sum, result) => sum + result.modelMetrics[name].meanCosine * result.modelMetrics[name].count, 0) / totalCount,
        meanSignAgreement: seedResults.reduce((sum, result) => sum + result.modelMetrics[name].meanSignAgreement * result.modelMetrics[name].count, 0) / totalCount
      };
    });
    return output;
  }

  function scientificPayload(result) {
    return {
      schema: result.schema,
      buildId: result.buildId,
      protocolId: result.protocolId,
      canonical: result.canonical,
      config: result.config,
      configHash: result.configHash,
      frozenConfigHash: result.frozenConfigHash,
      seeds: result.seeds,
      commissioning: result.commissioning,
      seedResults: result.seedResults,
      pooledMetrics: result.pooledMetrics,
      pooledScore: result.pooledScore,
      passingSeeds: result.passingSeeds,
      meanConsequenceMagnitude: result.meanConsequenceMagnitude,
      decision: result.decision
    };
  }

  function runSuite(options = {}) {
    const config = deepFreeze({ ...clone(DEFAULT_CONFIG), ...(options.config || {}) });
    const runVersion = options.runVersion || 'B';
    const canonical = options.canonical !== false;
    const seeds = options.seeds || config.officialSeeds;
    const commissioning = runCommissioning(config);
    const startedAt = new Date().toISOString();
    const seedResults = seeds.map((seed) => runSeed(seed, config, options.progress));
    const pooledMetrics = combineSeedMetrics(seedResults);
    const pooledScore = scoreSeed(pooledMetrics, config);
    const passingSeeds = seedResults.filter((result) => result.score.pass).length;
    const meanConsequenceMagnitude = mean(seedResults.map((result) => result.meanConsequenceMagnitude));
    const configHash = fnv1a(stableStringify(config));
    const frozenConfigHash = fnv1a(stableStringify(DEFAULT_CONFIG));
    const canonicalConfigMatch = !canonical || configHash === frozenConfigHash;
    const canonicalSeedsMatch = !canonical || stableStringify(seeds) === stableStringify(DEFAULT_CONFIG.officialSeeds);
    const valid = commissioning.pass &&
      meanConsequenceMagnitude >= config.minimumMeanConsequenceMagnitude &&
      canonicalConfigMatch &&
      canonicalSeedsMatch;
    const advance = valid && passingSeeds >= config.requiredPassingSeeds && pooledScore.pass;

    const result = {
      schema: 'EL-EXP-GAMMA-001-result-v1',
      buildId: BUILD_ID,
      protocolId: PROTOCOL_ID,
      runVersion,
      canonical,
      startedAt,
      completedAt: new Date().toISOString(),
      config,
      configHash,
      frozenConfigHash,
      seeds,
      commissioning,
      seedResults,
      pooledMetrics,
      pooledScore,
      passingSeeds,
      meanConsequenceMagnitude,
      decision: {
        valid,
        advance,
        canonicalConfigMatch,
        canonicalSeedsMatch,
        verdict: !valid
          ? 'INVALID_RUN'
          : advance
            ? 'ADVANCE_TO_PREREGISTERED_CAUSAL_GAMMA_EXPERIMENT'
            : 'DO_NOT_ADVANCE_THIS_GAMMA_REALIZATION',
        boundary: 'A negative result applies only to this measurement, representation, retrieval law, placement, parameterization, and protocol.'
      }
    };
    result.scientificFingerprint = fnv1a(stableStringify(scientificPayload(result)));
    return result;
  }

  function runCommissioningSmoke(progress = null) {
    const config = {
      ...clone(DEFAULT_CONFIG),
      warmupTicks: 8,
      horizon: 4,
      acquisitionEvents: 36,
      testEvents: 18,
      archiveCapacity: 24,
      officialSeeds: [DEFAULT_CONFIG.commissioningSeed],
      requiredPassingSeeds: 1
    };
    return runSuite({
      runVersion: 'COMMISSIONING-NON-EVIDENTIARY',
      canonical: false,
      seeds: [DEFAULT_CONFIG.commissioningSeed],
      config,
      progress
    });
  }

  return Object.freeze({
    BUILD_ID,
    PROTOCOL_ID,
    NODE_STATE_WIDTH,
    CONTEXT_WIDTH,
    ACTOR_WIDTH,
    DYAD_WIDTH,
    EVENT_WIDTH,
    SIGNATURE_WIDTH,
    CONSEQUENCE_WIDTH,
    EVENT_KINDS,
    CONTEXT_CHANNELS,
    CONTEXT_FAMILIES,
    SIGNATURE_FAMILIES,
    DEFAULT_CONFIG,
    GammaArchive,
    createWorld,
    stepWorld,
    contextVector,
    eventSignature,
    measureEvent,
    scheduleEvents,
    vectorMagnitude,
    predictionsFor,
    stableStringify,
    fnv1a,
    runCommissioning,
    runSeed,
    runSuite,
    runCommissioningSmoke,
    scientificPayload
  });
});
