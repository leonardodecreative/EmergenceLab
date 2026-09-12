'use strict';

const assert = require('assert');
const Candidate = require('../src/EL-EXP-GAMMA-004-core.js');

const tests = [];
function test(name, operation) {
  try {
    operation();
    tests.push({ name, pass: true });
    process.stdout.write(`PASS ${name}\n`);
  } catch (error) {
    tests.push({ name, pass: false, error: error.message });
    process.stdout.write(`FAIL ${name}: ${error.message}\n`);
  }
}

test('thirty candidate seeds are unique', () => {
  assert.strictEqual(Candidate.CANDIDATE_SEEDS.length, 30);
  assert.strictEqual(new Set(Candidate.CANDIDATE_SEEDS).size, 30);
});

test('lambda state remains independent and serializable', () => {
  const state = new Candidate.LambdaLensState();
  assert.strictEqual(state.serialize().schema, 'lambda-lens-error-state-v1');
});

test('current-frame alignment is idempotent', () => {
  const frame = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
  const typed = Array(14).fill(0).map((_, index) => (index - 7) / 100);
  const Gamma003 = require('../reference/EL-EXP-GAMMA-003-v1.7/src/EL-EXP-GAMMA-003-core.js');
  const meaning = Gamma003.bindMeaning(frame, typed);
  const aligned = Candidate.alignMeaningToCurrentFrame(meaning, frame);
  aligned.forEach((value, index) => assert(Math.abs(value - meaning[index]) < 1e-12));
});

test('lambda chooses historically lower-error expert', () => {
  const state = new Candidate.LambdaLensState({ ...Candidate.DEFAULT_CONFIG, lambdaDecay: 0, lambdaMinimumObservations: 1 });
  const actual = Array(14).fill(0.2);
  const ledger = Array(14).fill(-0.2);
  const lens = Array(14).fill(0.2);
  state.update(0, ledger, lens, actual);
  assert.deepStrictEqual(state.select(0, ledger, lens), lens);
});

test('commissioning suite passes', () => {
  const result = Candidate.runCommissioning();
  assert.strictEqual(result.pass, true, JSON.stringify(result));
});

const failures = tests.filter((entry) => !entry.pass);
process.stdout.write(`Summary: ${tests.length - failures.length} / ${tests.length} PASS\n`);
if (failures.length) process.exitCode = 1;
