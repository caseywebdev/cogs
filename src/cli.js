var _ = require('underscore');
var argv = require('commander');
var async = require('async');
var chalk = require('chalk');
var chokidar = require('chokidar');
var config = require('./config');
var fs = require('fs');
var getBuild = require('./get-build');
var getFile = require('./get-file');
var glob = require('glob');
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

chalk.enabled = argv.color;

var COLORS = {info: chalk.grey, success: chalk.green, error: chalk.red};

var watcher;

var alert = function (type, title, message) {
  var isError = type === 'error';
  if (!isError && argv.silent) return;
  message = COLORS[type]('[cogs] ' + chalk.bold(title) + ' ' + message);
  console[isError ? 'error' : 'log'](message);
  if (isError && !watcher) process.exit(1);
};

var argvError = function (message) {
  process.stderr.write(argv.helpInformation());
  alert('error', 'Whoops!', message);
};

if (argv.dir) {
  try { process.chdir(argv.dir); }
  catch (er) {
    argvError("Unable to change to directory '" + argv.dir + "'\n" + er);
  }
}

var hasMatchingDependency = function (file, changedPath) {
  return _.chain(file.requires.concat(file.links).concat(file.globs))
    .map('path')
    .any(_.partial(minimatch, changedPath))
    .value();
};

var bustGetFile = _.partial(memoize.bust, _, [getFile]);

var bust = function (changedPath, cb) {
  if (!changedPath) return cb();
  memoize.bust(changedPath);
  async.filter(_.keys(getFile.cache), function (filePath, cb) {
    getFile(filePath, function (er, file) {
      cb(!er && hasMatchingDependency(file, changedPath));
    });
  }, function (filePaths) {
    _.each(filePaths, bustGetFile);
    cb();
  });
};

var shouldSave = function (changedPath, filePath) {
  var build = config.get().manifest[filePath];
  return !changedPath || !build || hasMatchingDependency(build, changedPath);
};

var updateBuild = function (changedPath, filePath, sourceGlob, targets, cb) {
  if (!shouldSave(changedPath, filePath)) return cb();
  alert('info', filePath, 'Building...');
  var buildFn =
    targets ? _.partial(saveBuild, _, sourceGlob, targets) : getBuild;
  var start = Date.now();
  buildFn(filePath, function (er, build) {
    if (er) {
      alert('error', filePath, er);
      return cb(er);
    }
    var seconds = (Date.now() - start) / 1000;
    var message = '(' + seconds + 's) Built';
    if (targets) {
      message += ' and saved to\n  ' + build.targetPaths.join('\n  ');
    } else process.stdout.write(build.buffer);
    alert('success', filePath, message);
    cb();
  });
};

var saveChanged = function (changedPath, cb) {
  var builds = config.get().builds;
  async.each(_.keys(builds), function (sourceGlob, cb) {
    var targets = builds[sourceGlob];
    glob(sourceGlob, {nodir: true}, function (er, filePaths) {
      async.each(
        filePaths,
        _.partial(updateBuild, changedPath, _, sourceGlob, targets),
        cb
      );
    });
  }, cb);
};

var updateManifest = function (cb) {
  var manifestPath = config.get().manifestPath;
  if (!manifestPath) return cb();
  alert('info', manifestPath, 'Saving manifest...');
  var start = Date.now();
  saveManifest(function (er) {
    if (er) {
      alert('error', manifestPath, er);
      return cb(er);
    }
    var seconds = (Date.now() - start) / 1000;
    alert('success', manifestPath, '(' + seconds + 's) Manifest saved');
  });
};

var saveAll = function (__, changedPath) {
  if (changedPath) changedPath = path.relative('.', changedPath);
  bust(changedPath, function () {
    if (changedPath === argv.configPath) return loadConfig();
    async.series([_.partial(saveChanged, changedPath), updateManifest]);
  });
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
  watcher = chokidar.watch(paths, options).on('all', saveAll);
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
    return argvError("Unable to load '" + argv.configPath + "'\n" + er);
  }

  if (argv.manifestPath) _config.manifestPath = argv.manifestPath;

  if (argv.builds) _config.builds = argv.builds;

  if (_.isString(_config.watch)) _config.watch = [_config.watch];
  if (_.isArray(_config.watch)) _config.watch = {paths: _config.watch};
  if (_config.watch && _.isString(_.config.watch.path)) {
    _.config.watch.paths = [_.config.watch.path];
  }

  if (argv.watchPaths) {
    if (!_config.watch) _config.watch = {};
    _config.watch.paths = argv.watchPaths;
  }

  if (_config.watch && argv.usePolling) {
    if (!_config.watch.options) _config.watch.options = {};
    _config.watch.options.usePolling = true;
  }

  config.set(_config);

  config.get().watch ? initWatcher() : closeWatcher();

  saveAll();
};

loadConfig();
