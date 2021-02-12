#!/usr/bin/env node

import fs from 'fs';
import npath from 'path';
import url from 'url';

import chalk from 'chalk';
import commander from 'commander';
import _ from 'underscore';

import formatSize from './format-size.js';
import run from './run.js';

['SIGTERM', 'SIGINT'].forEach(sig => process.once(sig, () => process.exit()));

const { program } = commander;
const { path: thisPath } = url.parse(import.meta.url);
const packagePath = `${npath.dirname(thisPath)}/../package.json`;
const { version } = JSON.parse(fs.readFileSync(packagePath));

program
  .version(version)
  .description('The fast file transform pipeline.')
  .option('-c, --config-path [path]', 'load config from [path]', 'cogs.js')
  .option(
    '-d, --debounce [seconds]',
    'trigger a build at most every [seconds] seconds',
    parseFloat,
    0.1
  )
  .option(
    '-w, --watch-paths [path]',
    'rebuild if [path] changes, can be specified multiple times',
    (path, paths = []) => [].concat(paths, path)
  )
  .option(
    '-p, --use-polling',
    'use stat polling instead of fsevents when watching'
  )
  .option('-s, --silent', 'do not output build information, only errors')
  .option('-C, --no-color', 'disable colored output')
  .parse(process.argv);

const { color, silent, watchPaths } = program.opts();
const { blue, gray, green, magenta, red, yellow } = new chalk.Instance({
  level: color ? 1 : 0
});

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

const options = _.extend(_.omit(program.opts(), 'color', 'silent'), {
  onEnd,
  onError,
  onStart,
  onResult
});

run(options).catch(onError);
