'use strict';

const assert = require('assert');
const Gamma = require('../src/EL-EXP-GAMMA-003-core.js');

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

test('frozen widths are 14 typed and 98 meaning', () => {
  assert.strictEqual(Gamma.TYPED_CONSEQUENCE_WIDTH, 14);
  assert.strictEqual(Gamma.MEANING_WIDTH, 98);
});

test('all four arms are present exactly once', () => {
  assert.deepStrictEqual(Gamma.ARM_NAMES, ['consequenceOnly', 'writeMeaning', 'readMeaning', 'dualMeaning']);
  assert.deepStrictEqual(Gamma.CANDIDATE_ARMS, ['writeMeaning', 'readMeaning', 'dualMeaning']);
});

test('context-consequence binding preserves sign', () => {
  const frame = Array(7).fill(0.5);
  const typed = Array(14).fill(0);
  typed[0] = -0.4;
  const meaning = Gamma.bindMeaning(frame, typed);
  assert.strictEqual(meaning[0], -0.2);
});

test('neutral consequence binding ignores node context', () => {
  const typed = Array(14).fill(0.1);
  assert.deepStrictEqual(Gamma.neutralMeaning(typed), Gamma.bindMeaning(Array(7).fill(1), typed));
});

test('dual interpolation has exact endpoints', () => {
  const a = Array(98).fill(0.1);
  const b = Array(98).fill(0.3);
  assert.deepStrictEqual(Gamma.blendMeaning(a, b, 0), a);
  assert.deepStrictEqual(Gamma.blendMeaning(a, b, 1), b);
});

test('rounded world digest ignores sub-12-decimal drift', () => {
  const a = { x: 0.12345678901231 };
  const b = { x: 0.12345678901232 };
  assert.strictEqual(Gamma.roundedWorldDigest(a, 12), Gamma.roundedWorldDigest(b, 12));
});

test('commissioning passes', () => {
  const result = Gamma.runCommissioning();
  assert.strictEqual(result.pass, true, JSON.stringify(result));
});

if (tests.some((entry) => !entry.pass)) process.exitCode = 1;
console.log(`Summary: ${tests.filter((entry) => entry.pass).length} / ${tests.length} PASS`);
