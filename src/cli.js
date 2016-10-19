const _ = require('underscore');
const argv = require('commander');
const chokidar = require('chokidar');
const chalk = require('chalk');
const fileHasDependency = require('./file-has-dependency');
const fs = require('fs');
const normalizeConfig = require('./normalize-config');
const npath = require('npath');
const Promise = require('better-promise').default;
const saveBuild = require('./save-build');

const glob = Promise.promisify(require('glob'));

argv
  .version(require('../package').version)
  .usage('[options]')
  .option(
    '-c, --config-path [path]',
    'load config from [path] [default cogs.js]',
    'cogs.js'
  )
  .option('-d, --dir [path]', 'run in [path] instead of current directory')
  .option(
    '-w, --watch [path]',
    'build when [path] changes, can be specified multiple times',
    (path, paths) => {
      paths.push(path);
      return paths;
    },
    []
  )
  .option('-p, --use-polling', 'use stat polling instead of fsevents')
  .option('-s, --silent', 'do not output build information, only errors')
  .option('-C, --no-color', 'disable colored output')
  .parse(process.argv);

let config;
let watcher;

chalk.enabled = argv.color;
const COLORS = {success: chalk.green, error: chalk.red};
const log = (type, message) => {
  const isError = type === 'error';
  if (argv.silent && !isError) return;

  message = `[${type}] ${message}`;
  const color = COLORS[type];
  if (color) message = color(message);
  console[isError ? 'error' : 'log'](message);
};

const logErrorAndMaybeExit = message => {
  log('error', message);
  if (!watcher) process.exit(1);
};

const argvError = message => {
  process.stderr.write(argv.helpInformation());
  logErrorAndMaybeExit(message);
};

if (argv.dir) {
  try {
    process.chdir(argv.dir);
  } catch (er) {
    argvError(`Unable to run in directory '${argv.dir}'. ${er.message}`);
  }
}

let changedPaths = [];
let building = false;

const build = () => {
  if (building) return;

  const paths = changedPaths;
  changedPaths = [];
  if (_.contains(paths, argv.configPath)) return loadConfig();

  building = true;
  const status = {built: 0, unchanged: 0, failed: 0};
  const startedAt = _.now();
  log('info', 'Building...');
  return Promise.all(_.map(config.envs, env =>
    Promise.all(_.map(env.builds, (target, pattern) =>
      glob(pattern, {nodir: true}).then(paths =>
        Promise.all(_.map(paths, path =>
          saveBuild({env, path, pattern, target})
            .then(({didChange, targetPath}) => {
              if (!didChange) return ++status.unchanged;

              ++status.built;
              log('success', `${path} -> ${targetPath}`);
            })
            .catch(er => {
              ++status.failed;
              log('error', er);
            })
        ))
      )
    ))
  )).then(() => {
    const duration = ((_.now() - startedAt) / 1000).toFixed(2);
    const message = _.map(status, (n, label) => `${n} ${label}`).join(' | ');
    log('info', `${message} | ${duration}s`);
    if (status.failed > 0 && !watcher) process.exit(status.failed);

    building = false;
    if (changedPaths.length) return build();
  }).catch(logErrorAndMaybeExit);
};

const handleChangedPath = (__, path) => {
  path = npath.relative('.', path);
  _.each(config.envs, ({cache: {buffers, files}}) => {
    delete buffers[path];
    delete files[path];
    _.each(files, (file, key) => {
      if (Promise.isPromise(file) || fileHasDependency({file, path})) {
        delete files[key];
      }
    });
  });

  changedPaths.push(path);
  build();
};

const closeWatcher = () => {
  if (!watcher) return;

  watcher.close();
  watcher = null;
};

process.on('SIGTERM', closeWatcher);
process.on('SIGINT', closeWatcher);

const initWatcher = function () {
  closeWatcher();
  if (!argv.watch.length) return;

  watcher = chokidar.watch(
    _.map([argv.configPath].concat(argv.watch), path => npath.resolve(path)),
    {
      ignoreInitial: true,
      persistent: true,
      usePolling: argv.usePolling
    }
  ).on('all', handleChangedPath);
};

const loadConfig = () => {
  try {
    const path = npath.resolve(argv.configPath);
    if (!fs.existsSync(argv.configPath)) {
      throw new Error(`'${path}' does not exist`);
    }

    delete require.cache[path];
    config = normalizeConfig(require(path));
  } catch (er) {
    return argvError(`Unable to load '${argv.configPath}'. ${er.message}`);
  }

  initWatcher();
  build();
};

loadConfig();
