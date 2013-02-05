var _ = require('underscore');
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
  this.updateQueue = [];
};

_.extend(Asset.prototype, {
  update: function (cb) {
    if (cb && this.updateQueue.push(cb) > 1) return;
    var self = this;
    cb = function (er) {
      self.updateQueue.shift()(er);
      if (self.updateQueue.length) self.update();
    };
    fs.stat(this.abs, function (er, stats) {
      if (er) return cb(er);
      var mtime = +stats.mtime;
      if (self.mtime === mtime) return self.updateDirectives(cb);
      self.mtime = mtime;
      fs.readFile(self.abs, 'utf8', function (er, data) {
        if (er) return cb(er);
        var base = path.basename(self.abs);
        var i = 1 + base.indexOf('.');
        self.exts = i ? base.slice(i).toLowerCase().split('.') : [];
        self.raw = data;
        self.built = '';
        self.compressed = '';

        // Gather directives and store in self.directives
        self.scanDirectives(cb);
      });
    });
  },

  scanDirectives: function (cb) {

    // Grab the header of the file where any directives would be.
    var header = this.raw.match(headerRe) || [''];

    // Pull out the specific directive lines.
    var lines = header[0].match(directiveLineRe) || [];
    var self = this;
    var actions = _.map(lines, function (line) {

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
      return [action, argument];
    });

    // Push a requireself action to ensure the root file is included.
    actions.push(['requireself']);

    // Add the directive to the assets directives list.
    this.directives = _.map(actions, function (action) {
      return new Directive(self, action[0], action[1]);
    });

    this.process(cb);
  },

  processor: function () {
    return this.env.processors[this.ext()];
  },

  process: function (cb) {
    var processor = this.processor();
    if (!processor) return this.updateDirectives(cb);
    var self = this;
    this.exts.pop();
    processor.process(this, function (er) {
      if (er) return cb(er);
      self.process(cb);
    });
  },

  updateDirectives: function (cb) {
    var self = this;
    var done = _.after(self.directives.length, cb);
    _.invoke(this.directives, 'update', function (er) {
      if (er) return cb(er);
      done();
    });
  },

  dependencies: function (cb, visited, required) {
    visited || (visited = []);
    required || (required = []);
    if (!_.contains(visited, this)) {
      var self = this;
      return this.update(function (er) {
        if (er) return cb(er);
        visited.push(self);
        self.dependencies(cb, visited, required);
      });
    }
    var ext = this.ext();
    var directives = this.directives;
    var nextDirective = function (i) {
      var directive = directives[i];
      if (!directive) return cb(null, required);
      var dependencies = directive.dependencies;
      var nextDependency = function (j) {
        var dependency = dependencies[j];
        if (!dependency) return nextDirective(++i);
        if (_.contains(visited, dependency)) {
          if (ext === dependency.ext() && !_.contains(required, dependency)) {
            required.push(dependency);
          }
          nextDependency(++j);
        } else {
          dependency.dependencies(function (er) {
            if (er) return cb(er);
            nextDependency(++j);
          }, visited, required);
        }
      };
      nextDependency(0);
    };
    nextDirective(0);
  },

  build: function (cb) {
    var self = this;
    self.dependencies(function (er, dependencies) {
      if (er) return cb(er);
      self.built = _.invoke(dependencies, 'toBuild').join('\n');
      self.compress(cb);
    });
  },

  toBuild: function () {
    var ext = this.ext();
    var relative = path.relative(process.cwd(), this.abs);
    return (function () {
      switch (ext) {
      case 'js':
        return '// ' + relative;
      case 'css':
        return '/* ' + relative + ' */';
      case 'html':
        return '<!-- ' + relative + ' -->';
      default:
        return '';
      }
    })() + '\n' + this.raw.trim() + '\n';
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
  },

  saveToDir: function (dir, cb) {
    var self = this;
    this.build(function (er) {
      if (er) return cb(er);
      self.logical(function (er, logical) {
        if (er) return cb(er);
        var ext = (self.exts.length ? '.' : '') + self.exts.join('.');
        var target = path.resolve(dir, logical + ext);
        fs.writeFile(target, self.toString(), function (er) {
          if (er) return cb(er);
          cb();
        });
      });
    });
  },

  saveAs: function (target, cb) {
    var self = this;
    this.build(function (er) {
      if (er) return cb(er);
      target = path.resolve(process.cwd(), target);
      fs.writeFile(target, self.toString(), function (er) {
        if (er) return cb(er);
        cb();
      });
    });
  },

  logical: function (cb) {
    this.env.logical(this.abs, function (er, logical) {
      if (er) return cb(er);
      cb(null, logical);
    });
  },


  ext: function () {
    return _.last(this.exts);
  },

  toString: function () {
    return this.compressed || this.built || this.raw;
  }
});
