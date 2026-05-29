#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseArgs, styleText } from 'node:util';

import formatSize from './format-size.js';
import run from './run.js';

const { console, process, URL } = globalThis;

['SIGTERM', 'SIGINT'].forEach(sig => process.once(sig, () => process.exit()));

const { pathname: thisPath } = new URL(import.meta.url);
const packagePath = `${dirname(thisPath)}/../package.json`;
const { version } = JSON.parse(await readFile(packagePath));

const options = /** @type {const} */ ({
  'config-path': {
    description: 'Load config from [path]',
    type: 'string',
    short: 'c',
    default: 'cogs.js'
  },
  help: { description: 'Show usage details', type: 'boolean', short: 'h' },
  slient: { description: 'Only output errors', type: 'boolean', short: 's' },
  version: { description: 'Show version', type: 'boolean', short: 'v' },
  'watch-paths': {
    description: 'Rebuild if [path] changes, can be specified multiple times',
    type: 'string',
    short: 'w',
    multiple: true,
    default: /** @type {string[]} */ ([])
  }
});

/** @param {string} [errorMessage] */
const showHelp = errorMessage => {
  const maxKeyLength = Object.keys(options).reduce(
    (max, key) => Math.max(key.length, max),
    0
  );

  console[errorMessage ? 'error' : 'log'](
    `${errorMessage ? `${errorMessage}\n\n` : ''}The fast file transform pipeline

cogs [options]

${Object.entries(options)
  .map(
    ([key, { short, description }]) =>
      `--${key.padEnd(maxKeyLength)} -${short} ${description}`
  )
  .join('\n')}`
  );
  process.exit(errorMessage ? 1 : 0);
};

let values;

try {
  ({ values } = parseArgs({ options, strict: true }));
} catch (er) {
  throw showHelp(er.message);
}

if (values.help) throw showHelp();

if (values.version) {
  console.log(version);
  process.exit();
}

const { 'config-path': configPath, silent, 'watch-paths': watchPaths } = values;

let built;
let failed;
let start;
let totalSize;
let unchanged;

const log = silent ? () => {} : console.log.bind(console);

const onError = er => {
  console.error(er.stack);
  console.error(styleText('red', er.toString()));
  if (!watchPaths) process.exit(1);
};

const onStart = () => {
  log(styleText('gray', 'Building...'));
  built = failed = totalSize = unchanged = 0;
  start = Date.now();
};

const onResult = ({ didChange, error, size, sourcePath, targetPath }) => {
  if (error) {
    ++failed;
    return console.error(
      styleText('red', `Failed to build ${sourcePath}\n${error}`)
    );
  }

  totalSize += size;

  if (!didChange) return ++unchanged;

  ++built;
  log(
    [
      styleText('magenta', `${formatSize(size)}`),
      styleText('green', sourcePath),
      styleText('gray', '->'),
      styleText('blue', targetPath)
    ].join(' ')
  );
};

const onEnd = () => {
  log(
    [
      styleText('magenta', `${formatSize(totalSize)}`),
      styleText('green', `${built} built`),
      styleText('blue', `${unchanged} unchanged`),
      styleText('red', `${failed} failed`),
      styleText('yellow', `${((Date.now() - start) / 1000).toFixed(1)}s`)
    ].join(styleText('gray', ' | '))
  );
  if (!watchPaths && failed) {
    onError(new Error(`${failed} build${failed > 1 ? 's' : ''} failed`));
  }
};

try {
  await run({ configPath, onEnd, onError, onResult, onStart, watchPaths });
} catch (er) {
  onError(er);
}
