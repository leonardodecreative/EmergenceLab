'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const GammaExperiment = require('./EL-EXP-GAMMA-001-core.js');

function readArguments(argv) {
  const options = {
    official: false,
    commissioning: false,
    version: null,
    output: null
  };
  argv.forEach((argument) => {
    if (argument === '--official') options.official = true;
    else if (argument === '--commissioning') options.commissioning = true;
    else if (argument.startsWith('--version=')) options.version = argument.slice('--version='.length).toUpperCase();
    else if (argument.startsWith('--output=')) options.output = argument.slice('--output='.length);
    else if (argument === '--help' || argument === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  });
  return options;
}

function showHelp() {
  console.log(`
EL-EXP-GAMMA-001 terminal runner

Commissioning only (non-evidentiary):
  node EL-EXP-GAMMA-001-runner.js --commissioning

Official Version B:
  node EL-EXP-GAMMA-001-runner.js --official --version=B

Independent Version C:
  node EL-EXP-GAMMA-001-runner.js --official --version=C

Optional output path:
  --output=results/my-result.json
`);
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function formatPercent(value) {
  return `${(100 * value).toFixed(2)}%`;
}

function resultRows(result) {
  return result.seedResults.map((seedResult) => ({
    seed: seedResult.seed,
    gamma_rmse: seedResult.score.gammaRmse.toFixed(8),
    best_control: seedResult.score.bestBaseline,
    control_rmse: seedResult.score.bestBaselineRmse.toFixed(8),
    improvement: formatPercent(seedResult.score.baselineImprovement),
    vs_shuffled: formatPercent(seedResult.score.shuffledImprovement),
    pass: seedResult.score.pass ? 'PASS' : 'NO'
  }));
}

function defaultOutputName(result) {
  const version = result.runVersion.replace(/[^A-Z0-9-]/gi, '-');
  return `EL-EXP-GAMMA-001-${version}-${result.scientificFingerprint}.json`;
}

function main() {
  const options = readArguments(process.argv.slice(2));
  if (options.help) {
    showHelp();
    return;
  }
  if (options.official && options.commissioning) {
    throw new Error('Choose either --official or --commissioning, not both.');
  }
  if (!options.official && !options.commissioning) {
    throw new Error('Refusing an ambiguous run. Use --commissioning or --official --version=B.');
  }
  if (options.official && !['A', 'B', 'C'].includes(options.version)) {
    throw new Error('Official runs require --version=A, --version=B, or --version=C.');
  }

  console.log(`${GammaExperiment.BUILD_ID}`);
  console.log(options.official
    ? `Starting official Version ${options.version} on preregistered seeds ${GammaExperiment.DEFAULT_CONFIG.officialSeeds.join(', ')}.`
    : `Starting non-evidentiary commissioning seed ${GammaExperiment.DEFAULT_CONFIG.commissioningSeed}.`);

  let lastReportedSeed = null;
  const progress = ({ seed, eventIndex, eventCount }) => {
    if (lastReportedSeed !== seed || eventIndex + 20 >= eventCount) {
      console.log(`Seed ${seed}: event ${Math.min(eventIndex + 1, eventCount)} / ${eventCount}`);
      lastReportedSeed = seed;
    }
  };

  const result = options.official
    ? GammaExperiment.runSuite({ runVersion: options.version, canonical: true, progress })
    : GammaExperiment.runCommissioningSmoke(progress);

  const scientificJson = GammaExperiment.stableStringify(GammaExperiment.scientificPayload(result));
  result.scientificSha256 = sha256Text(scientificJson);
  result.artifacts = {
    coreSha256: sha256File(path.join(__dirname, 'EL-EXP-GAMMA-001-core.js')),
    runnerSha256: sha256File(__filename),
    testsSha256: sha256File(path.join(__dirname, 'EL-EXP-GAMMA-001-tests.js')),
    browserSmokeSha256: sha256File(path.join(__dirname, 'EL-EXP-GAMMA-001-browser-smoke.js')),
    protocolSha256: sha256File(path.join(__dirname, 'EL-EXP-GAMMA-001-PROTOCOL.md')),
    calibrationSha256: sha256File(path.join(__dirname, 'EL-EXP-GAMMA-001-CALIBRATION.md')),
    readmeSha256: sha256File(path.join(__dirname, 'README.md'))
  };

  const outputPath = path.resolve(options.output || defaultOutputName(result));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

  console.table(resultRows(result));
  console.log(`Commissioning: ${result.commissioning.passed}/${result.commissioning.total} PASS`);
  console.log(`Passing seeds: ${result.passingSeeds}/${result.seeds.length}`);
  console.log(`Pooled Gamma improvement over best control: ${formatPercent(result.pooledScore.baselineImprovement)}`);
  console.log(`Pooled Gamma improvement over shuffled history: ${formatPercent(result.pooledScore.shuffledImprovement)}`);
  console.log(`Verdict: ${result.decision.verdict}`);
  console.log(`Scientific fingerprint: ${result.scientificFingerprint}`);
  console.log(`Scientific SHA-256: ${result.scientificSha256}`);
  console.log(`Result: ${outputPath}`);
}

try {
  main();
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
}
