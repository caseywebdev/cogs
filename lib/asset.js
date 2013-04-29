var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var Directive = require('./directive');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var unknown = String.fromCharCode(65533);

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

  updateDependencies: function (cb, updated) {
    if (!updated) updated = [];
    if (_.contains(updated, this)) return cb(null, this.dependencies);
    var self = this;
    this.update(function (er) {
      if (er) return cb(er);
      var dependencies = self.dependencies || (self.dependencies = []);
      dependencies.length = 0;
      dependencies.push.apply(
        dependencies,
        _.unique(_.flatten(_.pluck(self.directives, 'dependencies')))
      );
      updated.push(self);
      async.map(dependencies, function (dependency, cb) {
        dependency.updateDependencies(cb, updated);
      }, function (er, _dependencies) {
        if (er) return cb(er);
        var cleaned = _.unique(_.flatten(_dependencies));
        dependencies.length = 0;
        dependencies.push.apply(dependencies, cleaned);
        cb(null, dependencies);
      });
    });
    return this;
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
    var relative = path.relative('.', this.abs);
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
    return this.compressed || this.built || this.raw;
  },

  toBuffer: function () {
    if (this.isBinary()) return this.buffer;
    return new Buffer(this.toString());
  },

  error: function (er) {
    var filenameContained = ~er.toString().indexOf(this.abs);
    if (!filenameContained) er.message = this.abs + ': ' + er.message;
    return er;
  },

  fingerprint: function () {
    return crypto
      .createHash(this.env.algorithm)
      .update(this.toBuffer())
      .digest('hex');
  },

  filename: function (fingerprint) {
    var base = this.env.split(this.abs).base;
    fingerprint = fingerprint ? '-' + this.fingerprint() : '';
    var ext = this.ext();
    return base + fingerprint + '.' + ext;
  },

  isBinary: function () { return !!~this.raw.indexOf(unknown); },

  saveToDir: function (src, dir, fingerprint, cb) {
    src = path.dirname(src).replace(/\/\*\*$/, '');
    dir = path.join(dir, path.dirname(path.relative(src, this.abs)));
    var self = this;
    mkdirp(dir, function (er) {
      if (er) return cb(er);
      var buffer = self.toBuffer();
      var standard = path.join(dir, self.filename());
      var exported = path.join(dir, self.filename(fingerprint));
      fs.writeFile(exported, buffer, cb);
      self.env.fingerprints[standard] = exported;
    });
    return this;
  }
});
