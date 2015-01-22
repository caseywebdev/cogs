var _ = require('underscore');
var chalk = require('chalk');
var chokidar = require('chokidar');
var config = require('./config');
var fs = require('fs');
var glob = require('glob');
var memoize = require('./memoize');
var minimatch = require('minimatch');
var optimist = require('optimist');
var path = require('path');
var saveBuild = require('./save-build');

var USAGE = [
  'Usage: $0 [options] config-path',
  '',
  'Environment:',
  '  COGS_CONFIG_PATH  JS or JSON config file.   [default: "cogs.json"]',
  '  COGS_DIR          Run in another directory. [default: "."]'
].join('\n');

var OPTIONS = {
  dir: {
    alias: 'd',
    type: 'string',
    desc: 'Run in another directory.'
  },
  'no-color': {
    alias: 'n',
    type: 'boolean',
    desc: 'Disable colored output.'
  },
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

chalk.enabled = !ARGV['no-color'];
var COLORS = {
  info: chalk.grey,
  success: chalk.green,
  error: chalk.red
};

var watcher;

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

var VERSION = require('../package').version;
if (ARGV.version) return alert('info', 'Version', VERSION);

if (ARGV.help) return optimist.showHelp();

var COGS_DIR = ARGV.dir || process.env.COGS_DIR || '.';
try { process.chdir(COGS_DIR); }
catch (er) {
  argvError("Unable to change to directory '" + COGS_DIR + "'\n" + er);
}

var CONFIG_PATH = ARGV._[0] || process.env.COGS_CONFIG_PATH || 'cogs.json';
var RESOLVED_CONFIG_PATH = path.resolve(CONFIG_PATH);

var shouldSave = function (changedPath, filePath) {
  var build = config.get().manifest[filePath];
  return !changedPath || !build ||
    _.chain(build.includes.concat(build.links).concat(build.globs))
      .map('path')
      .any(_.partial(minimatch, changedPath))
      .value();
};

var save = function (changedPath, filePath, sourceGlob, targets) {
  if (!shouldSave(changedPath, filePath)) return;
  alert('info', filePath, 'Building...');
  var start = Date.now();
  saveBuild(filePath, sourceGlob, targets, function (er) {
    if (er) return alert('error', filePath, er);
    var seconds = (Date.now() - start) / 1000;
    var savedTo = config.get().manifest[filePath].targetPaths.join('\n  ');
    var message = '(' + seconds + 's) Built and saved to\n  ' + savedTo;
    alert('success', filePath, message);
  });
};

var saveAll = function (__, changedPath) {
  if (changedPath) {
    changedPath = path.relative('.', changedPath);
    memoize.bust(changedPath);
    if (changedPath === CONFIG_PATH) return loadConfig();
  }
  _.each(config.get().builds, function (targets, sourceGlob) {
    glob(sourceGlob, {nodir: true}, function (er, filePaths) {
      _.each(filePaths, _.partial(save, changedPath, _, sourceGlob, targets));
    });
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
  if (_.isArray(watch)) watch = {paths: watch};
  var options = _.extend(WATCH_DEFAULTS, watch.options);
  var paths = [CONFIG_PATH].concat(_.map(watch.paths, resolve));
  watcher = chokidar.watch(paths, options).on('all', saveAll);
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
  saveAll();
};

loadConfig();
