'use strict';

var _ = require('underscore');
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
      cb(new Error('Invalid directive: "' + action + '"'));
      return this;
    }
    var self = this;
    return this[action](function (er, dependencies) {
      if (er) return cb(er);
      self.dependencies = dependencies;
      cb();
    });
  },

  // A special case require for the current asset.
  // If AMD concatenation is enabled, requireself will also need bring in
  // all of the modules is requires in `define`.
  requireself: function (cb) {
    cb(null, this.asset.amdDependencies.concat(this.asset));
    return this;
  },

  // Require a glob pattern.
  require: function (cb) {
    var target = path.resolve(path.dirname(this.asset.abs), this.argument);
    var env = this.asset.env;
    var info = glob(target, {stat: true}, function (er, files) {
      if (er) return cb(er);
      cb(null, _.reduce(files, function (assets, file) {
        if (!info.statCache[file].isDirectory()) assets.push(env.asset(file));
        return assets;
      }, []));
    });
    return this;
  },

  // Enable the reload flag.
  reload: function (cb) {
    this.asset.reload = true;
    cb(null, []);
    return this;
  }
});
