const commander = require('commander');

module.exports = argv =>
  commander
    .version(require('../package').version)
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
    .parse(argv);
