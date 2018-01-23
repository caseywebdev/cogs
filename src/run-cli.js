const _ = require('underscore');
const getLog = require('./get-log');
const parseArgv = require('./parse-argv');
const run = require('./run');

module.exports = async () => {
  const argv = parseArgv(process.argv);
  const {color, silent} = argv;
  const log = getLog({onlyErrors: silent, useColor: color});

  let results, start;

  const onError = er => {
    log('error', er);
    if (!argv.watchPaths) process.exit(1);
  };

  const onStart = () => {
    log('info', 'Building...');
    results = {changed: 0, unchanged: 0, failed: 0};
    start = _.now();
  };

  const onResult = ({error, sourcePath, targetPath, type}) => {
    ++results[type];
    if (type === 'unchanged') return;

    log(
      type === 'failed' ? 'error' : 'success',
      error || `${sourcePath} -> ${targetPath}`
    );
  };

  const onEnd = () => {
    const duration = ((_.now() - start) / 1000).toFixed(1);
    const message = _.map(results, (n, label) => `${n} ${label}`).join(' | ');
    log('info', `${message} | ${duration}s`);
    if (results.failed) {
      log('error', new Error(`${results.failed} builds failed`));
      if (!options.watch) process.exit(1);
    }
  };

  const options = _.extend(
    _.omit(argv, 'color', 'silent'),
    {onEnd, onError, onStart, onResult}
  );

  try { await run(options); } catch (er) { onError(er); }
};
