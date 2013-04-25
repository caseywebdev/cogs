var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var Directive = require('./directive');
var fs = require('fs');
var path = require('path');

var headerRe = new RegExp(
  '^(' +
    '\\s*(' +
      '(/\\*[\\s\\S]*?\\*/)|' + // Multi-line /* comment */
      '(###[\\s\\S]*?###)|' +   // Multi-line ### comment ###
      '(<!--[\\s\\S]*?-->)|' +  // HTML <!-- comment -->
      '(//.*)|' +               // Single-line // comment
      '(#.*)' +                 // Single-line # comment
    ')\\n?' +                   // Grab the trailing newline
  ')+'
);

var directiveLineRe = /^[^\w\n]*=[ \t]*\w+([ \t]+\S+(,[ \t]*\S+)*)?(\n|$)/gm;

var directiveRe = /\=[ \t]*(\S*)[ \t]*(.*)/;

var Asset = module.exports = function (env, abs) {
  this.env = env;
  this.abs = abs;
  this.queue = [];
};

_.extend(Asset.prototype, {
  update: function (cb) {
    var queue = this.queue;
    var self = this;
    var _cb = cb;
    cb = function (er) {
      if (er) er = self.error(er);
      _cb.apply(this, arguments);
    };
    if (queue.push(cb) > 1) return;
    cb = function (er) { while (cb = queue.shift()) cb(er); };
    fs.stat(this.abs, function (er, stats) {
      if (er) return cb(er);
      var mtime = +stats.mtime;
      if (self.mtime === mtime) return self.updateDirectives(cb);
      self.mtime = mtime;
      fs.readFile(self.abs, function (er, data) {
        if (er) return cb(er);
        self.exts = self.env.split(self.abs).exts;
        self.buffer = data;
        self.raw = data.toString();
        self.built = '';
        self.compressed = '';

        // Gather directives and store in self.directives
        self.scanDirectives(cb);
      });
    });
    return this;
  },

  scanDirectives: function (cb) {

    // Grab the header of the file where any directives would be.
    var header = this.raw.match(headerRe) || [''];

    // Pull out the specific directive lines.
    var lines = header[0].match(directiveLineRe) || [];
    var self = this;
    var directives = _.map(lines, function (line) {

      // Split the directive and argument.
      var directive = line.match(directiveRe);

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
      self.raw = self.raw.replace(line, '\n');

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
    if (!processor) return this.updateDirectives(cb);
    this.exts.pop();
    var self = this;
    processor.process(this, function (er) {
      if (er) return cb(er);
      self.process(cb);
    });
    return this;
  },

  updateDirectives: function (cb) {
    var update = function (directive, cb) { directive.update(cb); };
    async.each(this.directives, update, cb);
    return this;
  },

  scanDependencies: function (cb, visited) {
    visited || (visited = []);
    var self = this;
    if (!_.contains(visited, this)) {
      return this.update(function (er) {
        if (er) return cb(er);
        visited.push(self);
        self.scanDependencies(cb, visited);
      });
    }
    var ext = this.ext();
    async.map(this.directives, function (directive, cb) {
      async.map(directive.dependencies, function (dependency, cb) {
        var needsVisit = !_.contains(visited, dependency);
        if (needsVisit) return dependency.scanDependencies(cb, visited);
        cb(null, ext === dependency.ext() ? dependency : null);
      }, cb);
    }, function (er, dependencies) {
      if (er) return cb(er);
      cb(null, _.unique(_.compact(_.flatten(dependencies))));
    });
    return this;
  },

  updateDependencies: function (cb) {
    var self = this;
    return this.scanDependencies(function (er, dependencies) {
      if (er) return cb(er);
      self.dependencies = dependencies;
      cb();
    });
  },

  build: function (cb) {
    var self = this;
    return self.updateDependencies(function (er) {
      if (er) return cb(er);
      self.built = _.invoke(self.dependencies, 'toBuild').join('\n');
      self.compress(cb);
    });
  },

  toBuild: function () {
    var relative = path.relative(process.cwd(), this.abs);
    switch (this.ext()) {
    case 'js':
      return '// ' + relative + '\n' + this.raw.trim() + '\n';
    case 'css':
      return '/* ' + relative + ' */\n' + this.raw.trim() + '\n';
    case 'html':
      return '<!-- ' + relative + ' -->' + '\n' + this.raw.trim() + '\n';
    default:
      return this.raw;
    }
  },

  compressor: function () {
    return this.env.compressors[this.ext()];
  },

  compress: function (cb) {
    var compressor = this.compressor();
    if (!compressor) return cb();
    var self = this;
    compressor.compress(this.built, function (er, str) {
      if (er) return cb(er);
      self.compressed = str;
      cb();
    });
    return this;
  },

  logical: function (cb) {
    this.env.logical(this.abs, cb);
    return this;
  },

  ext: function () {
    return _.last(this.exts);
  },

  toString: function () {
    if (this.isBinary()) return this.buffer;
    return this.compressed || this.built || this.raw;
  },

  error: function (er) {
    var filenameContained = ~er.toString().indexOf(this.abs);
    if (!filenameContained) er.message = this.abs + ': ' + er.message;
    return er;
  },

  fingerprint: function (algorithm) {
    return crypto.createHash(algorithm).update(this.toString()).digest('hex');
  },

  filename: function (fingerprint) {
    var base = this.env.split(this.abs).base;
    fingerprint = fingerprint ? '-' + this.fingerprint(fingerprint) : '';
    var ext = this.ext();
    return base + fingerprint + '.' + ext;
  },

  isBinary: function () {
    return !!~this.raw.indexOf(String.fromCharCode(65533));
  }
});
