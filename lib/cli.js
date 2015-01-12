#!/usr/bin/env node

'use strict';

var _ = require('underscore');
var async = require('async');
var chalk = require('chalk');
var chokidar = require('chokidar');
var Env = require('./env');
var fs = require('fs');
var glob = require('glob');
var herit = require('herit');
var optimist = require('optimist');
var path = require('path');

var Cli = module.exports = herit({
  constructor: function (config) {
    this.config = {};
    this._config = config;
    this.restart();
    process.on('SIGTERM', this.close.bind(this));
  },

  restart: function () {
    this._config ? this.start(this._config) : this.startFromArgv();
  },

  startFromArgv: function () {
    var argv = Cli.getArgv();

    if (argv.version) return this.displayVersion();

    if (argv.help) return optimist.showHelp();

    var config = {};

    var configPath;
    var configBuffer;
    try {
      configPath = path.resolve(argv.config);
      configBuffer = fs.readFileSync(configPath);
      config = JSON.parse(configBuffer);
      config.configPath = configPath;
    } catch (er) {
      if (configBuffer) {
        optimist.showHelp();
        return this.alert('Whoops!', configPath + ' is malformed.', 'error');
      }
    }

    config = _.extend({
      targets: {},
      compressors: {
        js: 'uglify-js',
        css: 'csso'
      },
      ignore: '/\\.'
    }, config, _.pick.apply(_, [argv].concat(_.keys(Cli.options))));

    if (config.watch) config.watch = [configPath].concat(config.watch);

    config.rebuild = config.rebuild.trim();

    var targets = config.targets;
    _.each(argv._, function (target) {
      var split = target.split(':');
      targets[split[0]] = split[1];
    });

   if (_.isString(config.processors)) {
      config.processors = config.processors.split(',');
    }

    config.processors =
      _.reduce(config.processors, function (obj, val, key) {
        var split = val.split(':');
        var ext = split[1] ? split[0] : key;
        var module = split[1] ? split[1] : val;
        obj[ext] = require('./engines/' + module);
        return obj;
      }, {});

    if (_.isString(config.compressors)) {
      config.compressors = config.compressors.split(',');
    }

    config.compressors =
      _.reduce(config.compressors, function (obj, val, key) {
        var split = val.split(':');
        var ext = split[1] ? split[0] : key;
        var module = split[1] ? split[1] : val;
        obj[ext] = require('./engines/' + module);
        return obj;
      }, {});

    if (_.size(targets)) return this.start(config);

    optimist.showHelp();
    this.alert('Whoops!', 'Please specify at least one target.', 'error');
  },

  start: function (config) {
    this.config = config || {};

    this.dependencies = {};

    this.env = new Env();

    _.each(this.config.processors, function (ctor, ext) {
      this.env.processors[ext] = new ctor();
    }, this);

    if (this.config.compress) {
      _.each(this.config.compressors, function (ctor, ext) {
        this.env.compressors[ext] = new ctor();
      }, this);
    }

    if (this.config.options) this.parseOptions(this.config.options);

    chalk.enabled = !this.config['no-color'];

    this.saveAll();

    this.startWatching();
  },

  displayVersion: function () {
    this.alert('Version', require('../package').version, 'info');
  },

  colors: {
    info: chalk.grey,
    success: chalk.green,
    error: chalk.red
  },

  parseOptions: function (options) {
    for (var steps in options) {
      var val = options[steps];
      steps = steps.split('.');
      var obj = this.env;
      for (var i = 0, l = steps.length; i < l && obj; ++i) {
        i === l - 1 ? obj[steps[i]] = val : obj = obj[steps[i]];
      }
    }
  },

  alert: function (title, message, type) {
    if (this.config.silent && type !== 'error') return;
    message = this.colors[type]('[cogs] ' + chalk.bold(title) + ' ' + message);
    console[type === 'error' ? 'error' : 'log'](message);
    if (type === 'error' && !this.config.watch) process.exit(1);
  },

  save: function (file, src, dir, cb) {
    var title = path.relative('.', file);
    var self = this;
    this.alert(title, 'Building...', 'info');
    var done = function (er) {
      var message = er || 'Built in ' + ((new Date() - start) / 1000) + 's';
      self.alert(title, message, er ? 'error' : 'success');
      cb(er);
    };
    var start = new Date();
    var asset = this.env.asset(file);
    if (!this.dependencies[file]) this.dependencies[file] = [asset.abs];
    var fingerprint = this.config.fingerprint;
    asset.build(function (er) {
      if (er) return done(er);
      self.dependencies[file] = _.pluck(asset.dependencies(), 'abs');
      if (!dir) {
        process.stdout.write(asset.toString());
        return done();
      }
      asset.saveToDir(src, dir, fingerprint, done);
    });
  },

  saveAll: function (ev, changed) {
    if (changed && changed === this.config.configPath) return this.restart();
    var self = this;
    var targets = this.config.targets;
    var exportFileMap = this.config['export-file-map'];
    async.each(_.keys(targets), function (src, cb) {
      var dir = targets[src];
      var statCache = glob(src, {stat: true}, function (er, files) {
        async.each(files, function (file, cb) {
          if (statCache[file].isDirectory()) return;
          file = path.resolve(file);
          var isFirst = !self.dependencies[file];
          var isDependency = _.contains(self.dependencies[file], changed);
          if (isFirst || isDependency) self.save(file, src, dir, cb);
        }, cb);
      }).statCache;
    }, function () {
      if (!exportFileMap) return;
      var json = JSON.stringify(self.env.fileMap, null, '  ');
      fs.writeFileSync(exportFileMap, json);
    });
  },

  startWatching: function () {
    this.close();

    var watch = this.config.watch;
    if (!watch) return;

    this.watcher = chokidar
      .watch(_.map(watch, function (p) { return path.resolve(p); }), {
        ignored: new RegExp(this.config.ignore),
        ignoreInitial: true,
        persistent: true
      })
      .on('all', this.saveAll.bind(this));

    var rebuild = this.config.rebuild;
    if (rebuild === '-') return;

    process.stdin.setEncoding('utf8');
    process.stdin.resume();
    process.stdin.on('data', this.dataHandler = (function (data) {
      if (data.toString().trim() === rebuild) this.restart();
    }).bind(this));
  },

  close: function () {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    if (this.dataHandler) {
      process.stdin.removeListener('data', this.dataHandler);
      process.stdin.pause();
      this.dataHandler = null;
    }
  }
}, {
  usage: 'Usage: $0 [options] target-glob:destination-dir',

  options: {
    options: {
      alias: 'o',
      type: 'string',
      desc: 'JSON for options to be passed to processors and compressors.'
    },
    compress: {
      alias: 'c',
      type: 'boolean',
      desc: 'Compress using UglifyJS and CSSO.',
    },
    compressors: {
      alias: 'x',
      type: 'string',
      desc: 'Compressors to use for each extension.'
    },
    watch: {
      alias: 'w',
      type: 'string',
      desc: 'A path or comma-separated paths to watch.'
    },
    ignore: {
      alias: 'i',
      type: 'string',
      desc: 'A regex of file paths to ignore.'
    },
    config: {
      alias: 'C',
      type: 'string',
      desc: 'A config file (JS or JSON) specifying command line options.',
      default: 'cogs.json'
    },
    fingerprint: {
      alias: 'f',
      type: 'boolean',
      desc: 'Fingerprint files with their env.algorithm value.',
    },
    'export-file-map': {
      alias: 'F',
      type: 'string',
      desc: 'Save a JSON file with file mappings.'
    },
    silent: {
      alias: 's',
      type: 'boolean',
      desc: 'Silence build info, errors will still output to stderr.',
    },
    'no-color': {
      alias: 'n',
      type: 'boolean',
      desc: 'Do not color output.',
    },
    rebuild: {
      alias: 'r',
      type: 'string',
      desc: 'Type this command to manually rebuild all targets. Set to - to ' +
        'disable.',
      default: 'rb'
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
  },

  getArgv: _.memoize(function () {
    var argv = _.reduce(
      optimist.usage(this.usage).options(this.options).argv,
      function (argv, val, key) {
        if (val) argv[key] = val;
        return argv;
      },
      {}
    );

    if (argv.watch) argv.watch = argv.watch.split(',');
    if (argv.options) argv.options = JSON.parse(argv.options);

    return argv;
  })
});
