'use strict';

var _ = require('underscore');
var argv = require('commander');
var async = require('async');
var chokidar = require('chokidar');
var config = require('./config');
var fs = require('fs');
var getBuild = require('./get-build');
var getFile = require('./get-file');
var glob = require('glob');
var log = require('orgsync-logger');
var memoize = require('./memoize');
var minimatch = require('minimatch');
var path = require('path');
var saveBuild = require('./save-build');
var saveManifest = require('./save-manifest');

var split = function (str) { return str.split(','); };

argv
  .version(require('../package').version)
  .usage('[options] [source-glob[:target-dir] ...]')
  .option(
    '-c, --config-path [path]',
    'load config from [path] [default cogs.js]',
    'cogs.js'
  )
  .option('-d, --dir [path]', 'run in [path] instead of current directory')
  .option('-m, --manifest-path [path]', 'load/save build manifest at [path]')
  .option('-w, --watch-paths [paths]', 'rebuild when [paths] change', split)
  .option('-p, --use-polling', 'use stat polling instead of fsevents')
  .option('-s, --silent', 'do not output build information, only errors')
  .option('-C, --no-color', 'disable colored output')
  .parse(process.argv);

if (argv.args.length) {
  argv.builds = _.reduce(argv.args, function (builds, str) {
    var split = str.split(':');
    builds[split[0]] = split[1];
    return builds;
  }, {});
}

log.config.name = 'cogs';
log.config.colors = argv.color;
if (argv.silent) log.config.level = 'error';

var watcher;

var alert = function (type, message) {
  log[type](message);
  if (type === 'error' && !watcher) process.exit(1);
};

var argvError = function (message) {
  process.stderr.write(argv.helpInformation());
  alert('error', message);
};

if (argv.dir) {
  try { process.chdir(argv.dir); }
  catch (er) {
    argvError("Unable to run in directory '" + argv.dir + "'. " + er.message);
  }
}

var buildHasDependency = function (build, changedPath) {
  return (
    _.any(build.requires.concat(build.links), {path: changedPath}) ||
    _.any(
      build.globs,
      _.compose(_.partial(minimatch, changedPath), _.property('path'))
    )
  );
};

var shouldSave = function (changedPaths, filePath) {
  var build = config.get().manifest[filePath];
  return !changedPaths.length || !build ||
    _.any(changedPaths, _.partial(buildHasDependency, build));
};

var updateBuild = function (changedPaths, filePath, sourceGlob, targets, cb) {
  if (!shouldSave(changedPaths, filePath)) return cb();
  alert('info', 'Building ' + filePath);
  var buildFn =
    targets ? _.partial(saveBuild, _, sourceGlob, targets) : getBuild;
  var start = Date.now();
  buildFn(filePath, function (er, build, wasUpdated) {
    if (er) {
      alert('error', filePath + ' ' + er.message);
      return cb(er);
    }
    var ms = Date.now() - start;
    let message;
    if (wasUpdated) {
      message = `Built ${filePath}`;
      if (build.targetPaths.length) {
        message += ` and saved to ${build.targetPaths.join(', ')}`;
      }
      message += ' in ' + ms + 'ms';
    } else {
      message = `${filePath} is unchanged`;
    }
    if (!targets) process.stdout.write(build.buffer);
    alert('success', message);
    cb();
  });
};

var saveChanged = function (changedPaths, cb) {
  var builds = config.get().builds;
  async.each(_.keys(builds), function (sourceGlob, cb) {
    var targets = builds[sourceGlob];
    glob(sourceGlob, {nodir: true}, function (er, filePaths) {
      async.each(
        filePaths,
        _.partial(updateBuild, changedPaths, _, sourceGlob, targets),
        cb
      );
    });
  }, cb);
};

var updateManifest = function (cb) {
  var manifestPath = config.get().manifestPath;
  if (!manifestPath) return cb();
  saveManifest((er, wasUpdated) => {
    if (er) {
      alert('error', 'Error saving ' + manifestPath + '. ' + er.message);
      return cb(er);
    }
    if (wasUpdated) alert('success', `${manifestPath} updated`);
    cb();
  });
};

let changedPaths = [];
let savingAll = false;

var saveAll = function () {
  if (savingAll) return;
  const _changedPaths = changedPaths;
  changedPaths = [];
  if (_.contains(_changedPaths, argv.configPath)) return loadConfig();
  savingAll = true;
  async.waterfall([
    _.partial(saveChanged, _changedPaths),
    updateManifest
  ], () => {
    savingAll = false;
    if (changedPaths.length) saveAll();
  });
};

var fileHasDependency = function (file, changedPath) {
  return (
    _.contains(file.requires.concat(file.links), changedPath) ||
    _.any(file.globs, _.partial(minimatch, changedPath))
  );
};

var handleChangedPath = function (__, changedPath) {
  changedPath = path.relative('.', changedPath);

  // Remove the changed path from all memoized function caches.
  _.each(memoize.all, function (memoized) {
    delete memoized.cache[changedPath];
  });

  // Bust any getFile cached file that has a dependency on this changed path.
  _.each(
    _.filter(getFile.cache, _.partial(fileHasDependency, _, changedPath)),
    function (file) { delete getFile.cache[file.path]; }
  );

  changedPaths.push(changedPath);
  saveAll();
};

var closeWatcher = function () {
  if (!watcher) return;
  watcher.close();
  watcher = null;
};

process.on('SIGTERM', closeWatcher);

var WATCH_DEFAULTS = {
  ignoreInitial: true,
  persistent: true
};

var resolve = function (filePath) { return path.resolve(filePath); };

var initWatcher = function () {
  closeWatcher();
  var watch = config.get().watch;
  var options = _.extend(WATCH_DEFAULTS, watch.options);
  var paths = [argv.configPath].concat(_.map(watch.paths, resolve));
  watcher = chokidar.watch(paths, options).on('all', handleChangedPath);
};

var loadConfig = function () {
  var _config;

  try {
    var resolvedConfigPath = path.resolve(argv.configPath);
    if (!fs.existsSync(argv.configPath)) {
      throw new Error("'" + resolvedConfigPath + "' does not exist");
    }
    delete require.cache[resolvedConfigPath];
    _config = require(resolvedConfigPath);
  } catch (er) {
    return argvError("Unable to load '" + argv.configPath + "'. " + er.message);
  }

  if (argv.manifestPath) _config.manifestPath = argv.manifestPath;

  if (argv.builds) _config.builds = argv.builds;

  if (_.isString(_config.watch)) _config.watch = [_config.watch];
  if (_.isArray(_config.watch)) _config.watch = {paths: _config.watch};
  if (_config.watch && _.isString(_config.watch.path)) {
    _config.watch.paths = [_config.watch.path];
  }

  if (argv.watchPaths) {
    if (!_config.watch) _config.watch = {};
    _config.watch.paths = argv.watchPaths;
  }

  if (_config.watch && argv.usePolling) {
    if (!_config.watch.options) _config.watch.options = {};
    _config.watch.options.usePolling = true;
  }

  try { config.set(_config); }
  catch (er) { return alert('error', er.message); }

  if (config.get().watch) initWatcher(); else closeWatcher();

  saveAll();
};

loadConfig();
