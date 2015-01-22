var _ = require('underscore');
var chalk = require('chalk');
var chokidar = require('chokidar');
var config = require('./config');
var fs = require('fs');
var glob = require('glob');
var memoize = require('./memoize');
var optimist = require('optimist');
var path = require('path');
var saveBuild = require('./save-build');

var USAGE = "Usage: $0 [options] config-path (defaults to 'cogs.json')";

var OPTIONS = {
  version: {
    alias: 'v',
    type: 'boolean',
    desc: 'Display the version.'
  },
  help: {
    alias: 'h',
    type: 'boolean',
    desc: 'Display this help message.'
  }
};

var ARGV = optimist.usage(USAGE).options(OPTIONS).argv;

var COLORS = {
  info: chalk.grey,
  success: chalk.green,
  error: chalk.red
};

var WATCH_DEFAULTS = {
  ignoreInitial: true,
  persistent: true
};

var VERSION = require('../package').version;
if (process.env.COGS_DIR) process.chdir(process.env.COGS_DIR);
var CONFIG_PATH = ARGV._[0] || process.env.COGS_CONFIG || 'cogs.json';
var RESOLVED_CONFIG_PATH = path.resolve(CONFIG_PATH);

var alert = function (type, title, message) {
  var isError = type === 'error';
  message = COLORS[type]('[cogs] ' + chalk.bold(title) + ' ' + message);
  console[isError ? 'error' : 'log'](message);
  if (isError && !watcher) process.exit(1);
};

var argvError = function (message) {
  optimist.showHelp();
  alert('error', 'Whoops!', message);
};

var watcher;

var closeWatcher = function () {
  if (!watcher) return;
  watcher.close();
  watcher = null;
};

var save = function (__, changedPath) {
  if (changedPath) {
    changedPath = path.relative('.', changedPath);
    memoize.bust(changedPath);
    if (changedPath === CONFIG_PATH) return loadConfig();
  }
  _.each(config.get().builds, function (targets, sourceGlob) {
    glob(sourceGlob, {nodir: true}, function (er, filePaths) {
      _.each(filePaths, function (filePath) {
        alert('info', filePath, 'Building...');
        var start = Date.now();
        saveBuild(filePath, sourceGlob, targets, function (er) {
          if (er) return alert('error', filePath, er);
          var seconds = (Date.now() - start) / 1000;
          alert('success', filePath, 'Built in ' + seconds + 's');
        });
      });
    });
  });
};

var resolve = function (filePath) { return path.resolve(filePath); };

var initWatcher = function () {
  closeWatcher();
  var watch = config.get().watch;
  if (_.isArray(watch)) watch = {paths: watch};
  var options = _.extend(WATCH_DEFAULTS, watch.options);
  var paths = [CONFIG_PATH].concat(_.map(watch.paths, resolve));
  watcher = chokidar.watch(paths, options).on('all', save);
};

var loadConfig = function () {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      throw new Error("'" + RESOLVED_CONFIG_PATH + "' does not exist");
    }
    delete require.cache[RESOLVED_CONFIG_PATH];
    config.set(require(RESOLVED_CONFIG_PATH));
  } catch (er) {
    return argvError("Unable to load '" + CONFIG_PATH + "'\n" + er);
  }
  config.get().watch ? initWatcher() : closeWatcher();
  save();
};

module.exports = function () {
  process.on('SIGTERM', closeWatcher);
  if (ARGV.version) return alert('info', 'Version', VERSION);
  if (ARGV.help) return optimist.showHelp();
  loadConfig();
};
