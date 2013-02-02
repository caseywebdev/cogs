var _ = require('underscore');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

var Directive = module.exports = function (asset, action, argument) {
  this.asset = asset;
  this.action = action;
  this.argument = argument;
};

_.extend(Directive.prototype, {

  // Resolve a directive into asset dependencies.
  update: function (cb) {
    var action = this.action;
    if (!this[action]) return cb(new Error('Invalid directive: ' + action));
    var self = this;
    this[action](function (er, dependencies) {
      if (er) return cb(er);
      self.dependencies = dependencies;
      cb();
    });
  },

  // A special case require for the current asset.
  requireself: function (cb) {
    cb(null, [this.asset]);
  },

  // Require a single file.
  require: function (logical, cb) {
    if (_.isFunction(logical)) {
      cb = logical;
      logical = this.argument;
    }

    // Relative path case, convert to absolute path.
    if (logical[0] === '.') {
      logical = path.dirname(this.asset.abs) + '/' + logical;
    }

    this.asset.env.asset(logical, function (er, asset) {
      if (er) return cb(er);
      cb(null, [asset]);
    });
  },

  // Require many files, comma delimited.
  requiremany: function (logicals, cb) {
    if (_.isFunction(logicals)) {
      cb = logicals;
      logicals = this.argument.split(/\s*,\s*/);
    }
    var assets = [];
    var done = _.after(logicals.length, function () { cb(null, assets); });
    var self = this;
    _.each(logicals, function (logical) {
      self.require(logical, function (er, asset) {
        if (er) return cb(er);
        assets.push(asset[0]);
        done();
      });
    });
  },

  // Require a directory, just the first level.
  requiredir: function (cb) {
    var base = path.dirname(this.asset.abs);
    var target = path.resolve(base, this.argument);
    var self = this;
    fs.readdir(target, function (er, files) {
      if (er) return cb(er);
      self.requiremany(files, cb);
    });
  },

  // Require an entire directory, recursively.
  requiretree: function (cb) {
    var base = path.dirname(this.asset.abs);
    var target = path.resolve(base, this.argument);
    var self = this;
    glob(target + '/**/*.*', function (er, files) {
      if (er) return cb(er);
      self.requiremany(files, cb);
    });
  }
});
