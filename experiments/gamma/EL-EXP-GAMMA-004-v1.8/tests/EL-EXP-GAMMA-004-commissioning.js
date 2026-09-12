'use strict';

const fs = require('fs');
const path = require('path');
const Candidate = require('../src/EL-EXP-GAMMA-004-core.js');

const result = Candidate.runCommissioning();
const output = {
  schema: 'EL-EXP-GAMMA-004-commissioning-v1',
  status: 'excluded-seed-non-evidentiary',
  buildId: Candidate.BUILD_ID,
  protocolId: Candidate.PROTOCOL_ID,
  commissioningSeed: Candidate.DEFAULT_CONFIG.commissioningSeed,
  result
};
const destination = path.join(__dirname, 'EL-EXP-GAMMA-004-commissioning-output.json');
fs.writeFileSync(destination, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
result.checks.forEach((check) => process.stdout.write(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}\n`));
process.stdout.write(`Summary: ${result.passed} / ${result.total} PASS\n`);
process.stdout.write(`OUTPUT ${destination}\n`);
if (!result.pass) process.exitCode = 1;
