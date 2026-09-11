'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const directory = __dirname;
const html = fs.readFileSync(path.join(directory, 'EL-EXP-GAMMA-001.html'), 'utf8');
const core = fs.readFileSync(path.join(directory, 'EL-EXP-GAMMA-001-core.js'), 'utf8');
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
if (inlineScripts.length !== 1) throw new Error(`Expected one inline script; found ${inlineScripts.length}`);

const listeners = new Map();

function canvasContext() {
  const gradient = { addColorStop() {} };
  return new Proxy({ createRadialGradient() { return gradient; } }, {
    get(target, property) {
      if (property in target) return target[property];
      return () => {};
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    }
  });
}

function element(id) {
  const values = {
    version: 'B',
    sigma: '0.015',
    capacity: '48',
    horizon: '10'
  };
  return {
    id,
    value: values[id] || '',
    textContent: '',
    innerHTML: '',
    className: '',
    disabled: false,
    width: 840,
    height: 360,
    addEventListener(type, handler) { listeners.set(`${id}:${type}`, handler); },
    getContext() { return canvasContext(); },
    click() {}
  };
}

const elements = new Map();
const document = {
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, element(id));
    return elements.get(id);
  },
  createElement(id) { return element(id); }
};

const sandbox = {
  console,
  document,
  crypto: crypto.webcrypto,
  TextEncoder,
  Blob,
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  navigator: { clipboard: { async writeText() {} } },
  setTimeout,
  clearTimeout,
  Promise,
  fetch: async (resource) => ({
    async text() { return fs.readFileSync(path.join(directory, String(resource).replace(/^\.\//, '')), 'utf8'); }
  })
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

async function main() {
  const context = vm.createContext(sandbox);
  vm.runInContext(core, context, { filename: 'EL-EXP-GAMMA-001-core.js' });
  vm.runInContext(inlineScripts[0][1], context, { filename: 'EL-EXP-GAMMA-001-inline.js' });

  assert.strictEqual(elements.get('buildId').textContent, 'EL-EXP-GAMMA-001-v1.5.0');
  assert(listeners.has('commission:click'));
  assert(listeners.has('runOfficial:click'));
  assert(listeners.has('version:change'));
  listeners.get('version:change')();
  assert.strictEqual(elements.get('runOfficial').textContent, 'Run official Version B');

  await listeners.get('commission:click')();
  const result = vm.runInContext('currentResult', context);
  assert.strictEqual(result.canonical, false);
  assert.deepStrictEqual(Array.from(result.seeds), [13579]);
  assert.strictEqual(result.commissioning.pass, true);
  assert.strictEqual(typeof result.scientificSha256, 'string');
  assert.strictEqual(result.scientificSha256.length, 64);
  assert.strictEqual(elements.get('download').disabled, false);
  assert(elements.get('status').textContent.includes('complete'));
  assert(elements.get('details').textContent.includes('scientificSha256'));

  console.log('PASS browser script loads');
  console.log('PASS commissioning button uses excluded seed only');
  console.log('PASS browser SHA and export state are populated');
  console.log('Summary: 3 / 3 PASS');
}

main().catch((error) => {
  console.error(`FAIL ${error.stack || error.message}`);
  process.exitCode = 1;
});
