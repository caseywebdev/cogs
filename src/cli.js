#!/usr/bin/env node

import fs from 'fs';
import npath from 'path';

import chalk from 'chalk';
import { program } from 'commander';
import _ from 'underscore';

import formatSize from './format-size.js';
import run from './run.js';

const { URL } = globalThis;

['SIGTERM', 'SIGINT'].forEach(sig => process.once(sig, () => process.exit()));

const { pathname: thisPath } = new URL(import.meta.url);
const packagePath = `${npath.dirname(thisPath)}/../package.json`;
const { version } = JSON.parse(fs.readFileSync(packagePath));

program
  .name('cogs')
  .version(version)
  .description('The fast file transform pipeline.')
  .option('-c, --config-path [path]', 'load config from [path]', 'cogs.js')
  .option(
    '-w, --watch-paths [path]',
    'rebuild if [path] changes, can be specified multiple times',
    (path, paths = []) => [].concat(paths, path)
  )
  .option('-s, --silent', 'do not output build information, only errors')
  .parse(process.argv);

const { silent, watchPaths } = program.opts();
const { blue, gray, green, magenta, red, yellow } = chalk;

let built;
let failed;
let start;
let totalSize;
let unchanged;

const log = silent ? _.noop : console.log.bind(console);

const onError = er => {
  console.error(red(er));
  if (!watchPaths) process.exit(1);
};

const onStart = () => {
  log(gray('Building...'));
  built = failed = totalSize = unchanged = 0;
  start = _.now();
};

const onResult = ({ didChange, error, size, sourcePath, targetPath }) => {
  if (error) {
    ++failed;
    return console.error(red(`Failed to build ${sourcePath}\n${error}`));
  }

  totalSize += size;

  if (!didChange) return ++unchanged;

  ++built;
  log(
    [
      magenta(`${formatSize(size)}`),
      green(sourcePath),
      gray('->'),
      blue(targetPath)
    ].join(' ')
  );
};

const onEnd = () => {
  log(
    [
      magenta(`${formatSize(totalSize)}`),
      green(`${built} built`),
      blue(`${unchanged} unchanged`),
      red(`${failed} failed`),
      yellow(`${((_.now() - start) / 1000).toFixed(1)}s`)
    ].join(gray(' | '))
  );
  if (!watchPaths && failed) {
    onError(new Error(`${failed} build${failed > 1 ? 's' : ''} failed`));
  }
};

const options = _.extend(_.omit(program.opts(), 'silent'), {
  onEnd,
  onError,
  onStart,
  onResult
});

run(options).catch(onError);
