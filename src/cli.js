const _ = require('underscore');
const {promisify} = require('util');
const argv = require('commander');
const chalk = require('chalk');
const chokidar = require('chokidar');
const fileHasDependency = require('./file-has-dependency');
const fs = require('fs');
const getBuild = require('./get-build');
const maybeWrite = require('./maybe-write');
const normalizeConfig = require('./normalize-config');
const npath = require('npath');
const writeBuild = require('./write-build');

const glob = promisify(require('glob'));

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
    (path, paths) => [].concat(paths, path),
    []
  )
  .option('-p, --use-polling', 'use stat polling instead of fsevents')
  .option('-s, --silent', 'do not output build information, only errors')
  .option('-C, --no-color', 'disable colored output')
  .parse(process.argv);

let config;
let watcher;

const colors = new chalk.constructor({
  enabled: argv.color,
  level: argv.color ? 1 : 0
});
const COLORS = {success: colors.green, error: colors.red};
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

const flattenBuilds = build =>
  [].concat(build, ..._.map(build.builds, flattenBuilds));

const buildConfig = async ({config, configManifest = {}, status}) => {
  const handleError = er => {
    ++status.failed;
    log('error', er);
  };

  await Promise.all(_.map(config.envs, async env => {
    const envManifest = {};
    await Promise.all(_.map(env.builds, async (target, pattern) =>
      Promise.all(_.map(await glob(pattern, {nodir: true}), async path => {
        try {
          const builds = flattenBuilds(await getBuild({env, path}));
          await Promise.all(_.map(builds, async build => {
            try {
              const didChange = await writeBuild(build);
              envManifest[build.path] = build.targetPath;
              if (!didChange) return ++status.unchanged;

              ++status.built;
              log('success', `${build.path} -> ${build.targetPath}`);
            } catch (er) { handleError(er); }
          }));
        } catch (er) { handleError(er); }
      }))
    ));

    if (env.manifestPath) {
      const buffer = Buffer.from(JSON.stringify(envManifest));
      const targetPath = env.manifestPath;
      if (await maybeWrite({buffer, targetPath})) {
        log('success', `[manifest] -> ${env.manifestPath}`);
      }
    }

    if (env.then) {
      await buildConfig({
        config: env.then,
        configManifest: envManifest,
        status
      });
    }

    _.extend(configManifest, envManifest);
  }));

  if (config.manifestPath) {
    const buffer = Buffer.from(JSON.stringify(configManifest));
    const targetPath = config.manifestPath;
    if (await maybeWrite({buffer, targetPath})) {
      log('success', `[manifest] -> ${config.manifestPath}`);
    }
  }

  if (config.then) {
    await buildConfig({config: config.then, configManifest, status});
  }
};

const build = async () => {
  if (building) return;

  const paths = changedPaths;
  changedPaths = [];
  if (_.contains(paths, argv.configPath)) return loadConfig();

  building = true;
  const startedAt = _.now();
  log('info', 'Building...');

  const status = {built: 0, unchanged: 0, failed: 0};
  await buildConfig({config, status});

  const duration = ((_.now() - startedAt) / 1000).toFixed(1);
  const message = _.map(status, (n, label) => `${n} ${label}`).join(' | ');
  log('info', `${message} | ${duration}s`);
  if (status.failed > 0 && !watcher) {
    logErrorAndMaybeExit(new Error(`${status.failed} builds failed`));
  }

  if (!watcher) return process.exit();

  building = false;
  if (changedPaths.length) build();
};

const handleChangedPath = async (__, path) => {
  path = npath.relative('.', path);
  await Promise.all(_.map(config.envs, async ({cache: {buffers, files}}) => {
    delete buffers[path];
    delete files[path];
    await Promise.all(_.map(files, async (file, key) => {
      if (fileHasDependency({file: await file, path})) delete files[key];
    }));
  }));

  changedPaths.push(path);
  build();
};

const closeWatcher = () => {
  if (!watcher) return;

  watcher.close();
  watcher = null;
};

process.on('SIGTERM', closeWatcher);

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
