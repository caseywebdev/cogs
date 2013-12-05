'use strict';

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var glob = require('glob');
var herit = require('herit');
var path = require('path');

module.exports = herit({
  constructor: function (asset, action, argument) {
    this.asset = asset;
    this.action = action;
    this.argument = argument;
  },

  // Resolve a directive into asset dependencies.
  update: function (cb) {
    var action = this.action;
    if (!this[action]) {
      return cb(new Error('Invalid directive: "' + action + '"'));
    }
    var self = this;
    return this[action](function (er, dependencies) {
      if (er) return cb(er);
      if (!_.isArray(dependencies)) dependencies = [dependencies];
      self.dependencies = dependencies;
      cb();
    });
  },

  // A special case require for the current asset.
  requireself: function (cb) {
    cb(null, this.asset);
    return this;
  },

  // Require a single file.
  require: function (relative, cb) {
    if (_.isFunction(relative)) {
      cb = relative;
      relative = this.argument;
    }

    // Relative path case, convert to absolute path.
    if (relative[0] === '.') {
      relative = path.dirname(this.asset.abs) + '/' + relative;
    }

    var asset = this.asset.env.asset(relative);
    fs.exists(asset.abs, function (exists) {
      if (exists) return cb(null, asset);
      cb(new Error('Required ' + asset.abs + ' but it does not exist'));
    });
    return this;
  },

  // Require many files, comma delimited.
  requiremany: function (relatives, cb) {
    if (_.isFunction(relatives)) {
      cb = relatives;
      relatives = this.argument.split(/\s*,\s*/);
    }
    async.map(relatives, _.bind(this.require, this), cb);
    return this;
  },

  // Require a directory, just the first level.
  requireglob: function (pattern, cb) {
    if (_.isFunction(pattern)) {
      cb = pattern;
      pattern = this.argument;
    }
    var base = path.dirname(this.asset.abs);
    var target = path.resolve(base, pattern);
    var self = this;
    glob(target, function (er, files) {
      if (er) return cb(er);
      self.requiremany(files, cb);
    });
    return this;
  },

  // Require a directory, just the first level.
  requiredirectory: function (cb) {
    return this.requireglob(this.argument + '/*.*', cb);
  },

  // Require an entire directory, recursively.
  requiretree: function (cb) {
    return this.requireglob(this.argument + '/**/*.*', cb);
  },

  // Enable the reload flag.
  reload: function (cb) {
    this.asset.reload = true;
    cb(null, []);
  }
});
