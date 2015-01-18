'use strict';

var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var Directive = require('./directive');
var fs = require('fs');
var herit = require('herit');
var mkdirp = require('mkdirp');
var path = require('path');

module.exports = herit({

  unknown: String.fromCharCode(65533),

  headerRe: new RegExp(
    '^(' +
      '\\s*(' +
        '(/\\*[\\s\\S]*?\\*/)|' + // Multi-line /* comment */
        '(###[\\s\\S]*?###)|' +   // Multi-line ### comment ###
        '(<!--[\\s\\S]*?-->)|' +  // HTML <!-- comment -->
        '(//.*)|' +               // Single-line // comment
        '(#.*)' +                 // Single-line # comment
      ')\\n?' +                   // Grab the trailing newline
    ')+'
  ),

  directiveLineRe: /^[^\w\n]*=[ \t]*\w+([ \t]+\S+(,[ \t]*\S+)*)?(\n|$)/gm,

  directiveRe: /\=[ \t]*(\S*)[ \t]*(.*)/,

  addNameRe: /(define\s*\(\s*)([^\s'"])/,

  changeNameRe: /(define\s*\(\s*['"]).*?(['"])/,

  amdDefineRe: /define\s*\(\s*(?:['"](.*?)['"]\s*,\s*)?(?:\[([\s\S]*?)\])?/g,

  constructor: function (env, abs) {
    this.env = env;
    this.abs = abs;
    this.queue = [];
    this.name = _.invert(env.names)[this.relative()] ||
      path.relative(env.basePath, this.relativeBase());
    this.shim = env.shims[this.name];
  },

  update: function (cb) {
    var queue = this.queue;
    var self = this;
    if (queue.push(cb) > 1) return;
    cb = function (er) {
      self.queue = [];
      _.invoke(queue, 'call', this, er);
    };
    fs.stat(this.abs, function (er, stats) {
      if (er) return cb(self.error(er));
      var mtime = +stats.mtime;
      self.cached = self.mtime === mtime;
      if (self.cached) return self.updateDirectives(cb);
      if (self.reload) self.env.reload = true;
      fs.readFile(self.abs, function (er, data) {
        if (er) return cb(self.error(er));
        self.updateData(data, function (er) {
          if (er) return cb(self.error(er));
          self.mtime = mtime;
          cb();
        });
      });
    });
    return this;
  },

  updateData: function (data, cb) {
    this.data = data;
    this.exts = this.env.split(this.abs).exts;
    if (this.shim) this.exts.splice(this.exts[0] === 'js' ? 1 : 0, 0, 'shim');
    this.buffer = data;
    this.source = data.toString();
    this.built = '';
    this.amdDependencies = [];
    this.md5 = this.fingerprint();

    // Gather directives and store in this.directives.
    return this.scanDirectives(cb);
  },

  scanDirectives: function (cb) {

    // Grab the header of the file where any directives would be.
    var header = this.source.match(this.headerRe) || [''];

    // Pull out the specific directive lines.
    var lines = header[0].match(this.directiveLineRe) || [];
    var self = this;
    var directives = _.map(lines, function (line) {

      // Split the directive and argument.
      var directive = line.match(self.directiveRe);

      // Normalize the directive action. This allows the use of any of
      //     = require_self
      //     = requireSelf
      //     = requireself
      // etc...
      var action = directive[1].toLowerCase().replace(/[^a-z]/g, '');

      // Should be undefined for `requireself`, but exist for everything else.
      var argument = directive[2];

      // Erase the directive line in the source, but leave a new line for
      // debugging purposes (ie `error on line n`).
      self.source = self.source.replace(line, '\n');

      // Push the action
      return {action: action, argument: argument};
    });

    // Push a requireself action to ensure the root file is included.
    directives.push({action: 'requireself'});

    // Add the directive to the assets directives list.
    this.directives = _.map(directives, function (directive) {
      return new Directive(self, directive.action, directive.argument);
    });
    return this.process(cb);
  },

  processor: function () {
    return this.env.processors[this.ext()];
  },

  process: function (cb) {
    var processor = this.processor();
    if (!processor) return this.compress(cb);
    this.exts.pop();
    var self = this;
    processor.run(this, function (er) {
      if (er) return cb(self.error(er));
      self.process(cb);
    });
    return this;
  },

  compressor: function () {
    return this.env.compressors[this.ext()];
  },

  compress: function (cb) {
    var compressor = this.compressor();
    if (!compressor || _.contains(compressor.ignore, this.name)) {
      return this.checkAmd(cb);
    }
    var self = this;
    compressor.run(this, function (er) {
      if (er) return cb(self.error(er));
      self.checkAmd(cb);
    });
    return this;
  },

  checkAmd: function (cb) {
    if (this.ext() === 'js' && this.env.concatAmd) {
      var self = this;
      return this.addName().updateAmdDependencies(function (er) {
        if (er) return cb(self.error(er));
        self.updateDirectives(cb);
      });
    }
    return this.updateDirectives(cb);
  },

  addName: function () {
    var name = this.name;
    var defined = this.amdDefineMatches();

    // If the source has one named module in it, rename it to what the user
    // expects it to be. This generally only happens with authors release
    // packages that don't follow the best practice of defining themselves
    // anonymously. If that's not the case, simply add the name to the `define`.
    if (defined.length === 1 && defined[0][1]) {
      this.source = this.source.replace(this.changeNameRe, '$1' + name + '$2');
    } else {
      this.source = this.source.replace(this.addNameRe, "$1'" + name + "', $2");
    }
    return this;
  },

  updateDirectives: function (cb) {
    var update = function (directive, cb) { directive.update(cb); };
    async.each(this.directives, update, cb);
    return this;
  },

  updateDependencies: function (cb, updated) {
    if (!updated) updated = {};
    if (updated[this.abs]) return cb();
    var self = this;
    this.update(function (er) {
      if (er) return cb(self.error(er));
      updated[self.abs] = true;
      async.each(self.rootDependencies(), function (dependency, cb) {
        dependency.updateDependencies(cb, updated);
      }, cb);
    });
    return this;
  },

  rootDependencies: function () {
    return _.unique(_.flatten(_.pluck(this.directives, 'dependencies')));
  },

  dependencies: function (visited) {
    if (!visited) visited = {};
    if (visited[this.abs]) return this;
    visited[this.abs] = true;
    var graph = _.invoke(this.rootDependencies(), 'dependencies', visited);
    return _.unique(_.flatten(graph));
  },

  amdDefineMatches: function () {
    var match;
    var matches = [];
    while (match = this.amdDefineRe.exec(this.source)) matches.push(match);
    return matches;
  },

  amdDependencyIds: function () {
    var definedIds = ['require', 'exports', 'module'];
    var requiredIds = [];
    this.source.match(this.amdDefineRe);
    _.each(this.amdDefineMatches(), function (match) {
      if (match[1]) definedIds.push(match[1]);
      if (match[2]) {
        requiredIds = requiredIds.concat(
          _.invoke(match[2].split(/\s*,\s*/), 'slice', 1, -1)
        );
      }
    });

    // Remove any modules that were defined in the file from the required list.
    // These modules will not be necessary to add as dependencies since they are
    // self-contained.
    return _.difference(requiredIds, definedIds);
  },

  updateAmdDependencies: function (cb) {
    var self = this;
    async.map(this.amdDependencyIds(), function (id, cb) {
      var abs = self.env.names[id];
      if (abs) return cb(null, self.env.asset(abs));
      var target = path.resolve(self.env.basePath, id);
      self.env.glob(target + '*', function (er, assets) {
        if (er) return cb(self.error(er));
        var match = _.find(assets, _.matches({name: id}));
        if (!match) return cb(new Error("Cannot find module '" + id + "'"));
        cb(null, match);
      }).statCache;
    }, function (er, dependencies) {
      if (er) return cb(self.error(er));
      cb(null, self.amdDependencies = dependencies);
    });
    return this;
  },

  checkReload: function (cb) {
    if (!this.env.reload) return cb();
    this.env.reload = false;
    async.each(this.dependencies(), function (dependency, cb) {
      dependency.cached ? dependency.updateData(dependency.data, cb) : cb();
    }, cb);
    return this;
  },

  build: function (cb) {
    var self = this;
    async.series([
      _.bind(this.updateDependencies, this),
      _.bind(this.checkReload, this)
    ], function (er) {
      if (er) return cb(self.error(er));
      self.built = _.invoke(self.dependencies(), 'toBuild').join('\n');
      cb();
    });
    return this;
  },

  relative: function () { return path.relative('.', this.abs); },

  relativeBase: function () {
    return path.join(
      path.dirname(this.relative()),
      this.env.split(this.abs).base
    );
  },

  toBuild: function () {
    var source = this.source.trim();
    switch (this.ext()) {
    case 'js':
      return '// ' + this.relative() + '\n' + source + '\n';
    case 'css':
      return '/* ' + this.relative() + ' */\n' + source + '\n';
    case 'html':
      return '<!-- ' + this.relative() + ' -->' + '\n' + source + '\n';
    default:
      return source;
    }
  },

  ext: function () {
    return _.last(this.exts);
  },

  toString: function () {
    return this.built || this.source;
  },

  toBuffer: function () {
    if (this.isBinary()) return this.buffer;
    return new Buffer(this.toString());
  },

  error: function (er) {
    var line = '\n  ' + this.relative();
    if (er.toString().indexOf(line) === -1) er.message += line;
    return er;
  },

  fingerprint: function () {
    var hash = crypto.createHash('md5');
    hash.end(this.toBuffer());
    return hash.read().toString('hex');
  },

  filename: function (fingerprint) {
    var base = this.env.split(this.abs).base;
    fingerprint = fingerprint ? '-' + this.fingerprint() : '';
    var ext = this.ext();
    return base + fingerprint + (ext ? '.' + ext : '');
  },

  isBinary: function () { return !!~this.source.indexOf(this.unknown); },

  exportPath: function (src, dir, fingerprint) {
    src = path.dirname(src).replace(/\/\*\*$/, '');
    dir = path.join(dir, path.dirname(path.relative(src, this.abs)));
    return path.join(dir, this.filename(fingerprint));
  },

  saveToDir: function (src, dir, fingerprint, cb) {
    var dist = this.exportPath(src, dir);
    var buffer = this.toBuffer();
    var saves = [async.apply(fs.writeFile, dist, buffer)];
    if (fingerprint) {
      dist = this.exportPath(src, dir, true);
      saves.push(async.apply(fs.writeFile, dist, buffer));
    }
    var dependencies = this.dependencies();
    this.env.manifest[this.relative()] = {
      dist: dist,
      dependencies: _.object(
        _.invoke(dependencies, 'relative'),
        _.map(dependencies, 'md5')
      )
    };
    var self = this;
    mkdirp(path.dirname(dist), function (er) {
      if (er) return cb(self.error(er));
      async.parallel(saves, cb);
    });
    return this;
  }
});
