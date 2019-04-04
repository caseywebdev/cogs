const _ = require('underscore');
const chalk = require('chalk');
const formatSize = require('./format-size');
const parseArgv = require('./parse-argv');
const run = require('./run');

['SIGTERM', 'SIGINT'].forEach(sig => process.once(sig, () => process.exit()));

const argv = parseArgv(process.argv);
const { color, silent } = argv;
const { blue, gray, green, magenta, red, yellow } = new chalk.constructor({
  enabled: color,
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
  if (!argv.watchPaths) process.exit(1);
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
  if (!argv.watchPaths && failed) {
    onError(new Error(`${failed} build${failed > 1 ? 's' : ''} failed`));
  }
};

const options = _.extend(_.omit(argv, 'color', 'silent'), {
  onEnd,
  onError,
  onStart,
  onResult
});

run(options).catch(onError);
