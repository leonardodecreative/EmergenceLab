'use strict';

const assert = require('assert');
const Gamma = require('../src/EL-EXP-GAMMA-002-core.js');

const seed = Gamma.DEFAULT_CONFIG.commissioningSeed;
const tests = [];

function test(name, operation) {
  try {
    operation();
    tests.push({ name, pass: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    tests.push({ name, pass: false, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function event(overrides = {}) {
  return {
    eventId: 'test-event',
    actorId: 0,
    targetId: 1,
    kind: 0,
    strength: 0.2,
    ...overrides
  };
}

function approximatelyEqual(actual, expected, tolerance = 1e-12) {
  assert(Math.abs(actual - expected) <= tolerance, `expected ${expected}, received ${actual}`);
}

test('frozen circular phase indices are exact', () => {
  assert.deepStrictEqual(Gamma.CIRCULAR_PHASE_INDICES, [10, 11, 12, 33, 34, 35]);
});

test('circular phase distance crosses the normalized wrap boundary', () => {
  approximatelyEqual(Gamma.phaseCoordinateDistance(0.99, 0.01), 0.02);
  approximatelyEqual(Gamma.phaseCoordinateDistance(0.01, 0.99), 0.02);
  approximatelyEqual(Gamma.phaseCoordinateDistance(0.25, 0.75), 0.50);
});

test('linear family distance remains byte-identical when circular mode is disabled', () => {
  const a = Array.from({ length: Gamma.SIGNATURE_WIDTH }, (_, index) => (index % 11) / 10);
  const b = Array.from({ length: Gamma.SIGNATURE_WIDTH }, (_, index) => ((index * 3) % 11) / 10);
  let total = 0;
  Gamma.SIGNATURE_FAMILIES.forEach((family) => {
    let squared = 0;
    for (let index = family.start; index < family.end; index += 1) {
      const difference = a[index] - b[index];
      squared += difference * difference;
    }
    total += Math.sqrt(squared / Math.max(1, family.end - family.start));
  });
  const frozenV15Distance = total / Gamma.SIGNATURE_FAMILIES.length;
  assert.strictEqual(
    Gamma.familyBalancedDistance(a, b, Gamma.SIGNATURE_FAMILIES, false),
    frozenV15Distance
  );
});

test('phase-only wrap difference is closer under circular geometry', () => {
  const a = Array(Gamma.SIGNATURE_WIDTH).fill(0);
  const b = Array(Gamma.SIGNATURE_WIDTH).fill(0);
  a[10] = 0.99;
  b[10] = 0.01;
  const linear = Gamma.familyBalancedDistance(a, b, Gamma.SIGNATURE_FAMILIES, false);
  const circular = Gamma.familyBalancedDistance(a, b, Gamma.SIGNATURE_FAMILIES, true);
  assert(circular < linear);
});

test('frequency-only difference is unchanged by circular geometry', () => {
  const a = Array(Gamma.SIGNATURE_WIDTH).fill(0);
  const b = Array(Gamma.SIGNATURE_WIDTH).fill(0);
  b[7] = 0.73;
  assert.strictEqual(
    Gamma.familyBalancedDistance(a, b, Gamma.SIGNATURE_FAMILIES, false),
    Gamma.familyBalancedDistance(a, b, Gamma.SIGNATURE_FAMILIES, true)
  );
});

test('embedded commissioning suite passes', () => {
  const result = Gamma.runCommissioning();
  assert.strictEqual(result.pass, true);
  assert.strictEqual(result.passed, result.total);
});

test('signature and consequence schemas are non-scalar and fixed', () => {
  const world = Gamma.createWorld(seed);
  const signature = Gamma.eventSignature(world, event());
  const measured = Gamma.measureEvent(world, event(), 3);
  assert.strictEqual(signature.length, Gamma.SIGNATURE_WIDTH);
  assert.strictEqual(Gamma.SIGNATURE_WIDTH, 49);
  assert.strictEqual(measured.consequence.length, Gamma.CONSEQUENCE_WIDTH);
  assert.strictEqual(Gamma.CONSEQUENCE_WIDTH, 23);
  assert(signature.every(Number.isFinite));
  assert(measured.consequence.every(Number.isFinite));
});

test('signature records the actor state as well as the target context', () => {
  const worldA = Gamma.createWorld(seed);
  const worldB = JSON.parse(JSON.stringify(worldA));
  worldB.nodes[0].theta.phase[0] = Math.min(1, worldB.nodes[0].theta.phase[0] + 0.21);
  const signatureA = Gamma.eventSignature(worldA, event({ kind: 2 }));
  const signatureB = Gamma.eventSignature(worldB, event({ kind: 2 }));
  assert.notStrictEqual(Gamma.stableStringify(signatureA), Gamma.stableStringify(signatureB));
});

test('actor-target direction is not erased', () => {
  const world = Gamma.createWorld(seed);
  const forward = Gamma.eventSignature(world, event({ actorId: 0, targetId: 1 }));
  const reverse = Gamma.eventSignature(world, event({ actorId: 1, targetId: 0 }));
  assert.notStrictEqual(Gamma.stableStringify(forward), Gamma.stableStringify(reverse));
});

test('one acquisition block balances every directed pair and event kind', () => {
  const config = {
    ...JSON.parse(JSON.stringify(Gamma.DEFAULT_CONFIG)),
    acquisitionEvents: 180,
    testEvents: 0
  };
  const schedule = Gamma.scheduleEvents(seed, config);
  assert.strictEqual(schedule.length, 180);
  const keys = new Set(schedule.map((item) => `${item.actorId}>${item.targetId}:${item.kind}`));
  assert.strictEqual(keys.size, 180);
});

test('measurement is factual minus matched suppression and preserves input', () => {
  const world = Gamma.createWorld(seed);
  const before = Gamma.stableStringify(world);
  const zero = Gamma.measureEvent(world, event({ strength: 0 }), 5);
  assert(zero.consequence.every((value) => Math.abs(value) < 1e-15));
  assert.strictEqual(Gamma.stableStringify(world), before);
});

test('Gamma archive is bounded and serializable without touching node state', () => {
  const world = Gamma.createWorld(seed);
  const before = Gamma.stableStringify(world);
  const archive = new Gamma.GammaArchive(2);
  for (let index = 0; index < 3; index += 1) {
    const current = event({ eventId: `archive-${index}`, kind: index });
    const measured = Gamma.measureEvent(world, current, 2);
    archive.record({
      ...current,
      signature: measured.signature,
      consequence: measured.consequence,
      confidence: 1,
      tick: index,
      horizon: 2
    });
  }
  assert.strictEqual(archive.entries.length, 2);
  assert.strictEqual(archive.entries[0].eventId, 'archive-1');
  assert.strictEqual(archive.serialize().schema, 'gamma-001-v1');
  assert.strictEqual(Gamma.stableStringify(world), before);
});

test('commissioning smoke is exactly repeatable', () => {
  const first = Gamma.runCommissioningSmoke();
  const second = Gamma.runCommissioningSmoke();
  assert.strictEqual(first.scientificFingerprint, second.scientificFingerprint);
  assert.strictEqual(
    Gamma.stableStringify(Gamma.scientificPayload(first)),
    Gamma.stableStringify(Gamma.scientificPayload(second))
  );
});

test('commissioning never uses a preregistered official seed', () => {
  assert(!Gamma.DEFAULT_CONFIG.officialSeeds.includes(seed));
  const result = Gamma.runCommissioningSmoke();
  assert.deepStrictEqual(result.seeds, [seed]);
  assert.strictEqual(result.canonical, false);
});

test('a canonical label cannot hide altered parameters or substituted seeds', () => {
  const config = {
    ...JSON.parse(JSON.stringify(Gamma.DEFAULT_CONFIG)),
    warmupTicks: 2,
    horizon: 2,
    acquisitionEvents: 12,
    testEvents: 6,
    archiveCapacity: 8,
    officialSeeds: [seed],
    requiredPassingSeeds: 1
  };
  const result = Gamma.runSuite({
    runVersion: 'B',
    canonical: true,
    seeds: [seed],
    config
  });
  assert.strictEqual(result.decision.valid, false);
  assert.strictEqual(result.decision.canonicalConfigMatch, false);
  assert.strictEqual(result.decision.canonicalSeedsMatch, false);
  assert.strictEqual(result.decision.verdict, 'INVALID_RUN');
});

const passed = tests.filter((entry) => entry.pass).length;
console.log(`\nSummary: ${passed} / ${tests.length} PASS`);
if (passed !== tests.length) process.exitCode = 1;
