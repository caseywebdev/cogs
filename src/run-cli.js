const _ = require('underscore');
const chalk = require('chalk');
const formatSize = require('./format-size');
const parseArgv = require('./parse-argv');
const run = require('./run');

module.exports = async () => {
  const argv = parseArgv(process.argv);
  const {color, silent} = argv;
  const {blue, gray, green, magenta, red, yellow} = new chalk.constructor({
    enabled: color,
    level: color ? 1 : 0
  });

  let results, start;

  const log = silent ? _.noop : console.log.bind(console);

  const onError = er => {
    console.error(red(er));
    if (!argv.watchPaths) process.exit(1);
  };

  const onStart = () => {
    log(gray('Building...'));
    results = {changed: 0, unchanged: 0, failed: 0};
    start = _.now();
  };

  const onResult = ({error, size, sourcePath, targetPath, type}) => {
    ++results[type];
    if (type === 'unchanged') return;

    if (error) return console.error(red(error));

    log([
      magenta(`${formatSize(size)}`),
      green(sourcePath),
      gray('->'),
      blue(targetPath)
    ].join(' '));
  };

  const onEnd = () => {
    log([
      green(`${results.changed} changed`),
      blue(`${results.unchanged} unchanged`),
      red(`${results.failed} failed`),
      yellow(`${((_.now() - start) / 1000).toFixed(1)}s`)
    ].join(gray(' | ')));
    if (!argv.watchPaths && results.failed) {
      onError(new Error(`${results.failed} builds failed`));
    }
  };

  const options = _.extend(
    _.omit(argv, 'color', 'silent'),
    {onEnd, onError, onStart, onResult}
  );

  try { await run(options); } catch (er) { onError(er); }
};
