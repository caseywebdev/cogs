var _ = require('underscore');
var Asset = require('./asset');
var engines = require('./engines');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var path = require('path');

module.exports = _.inherit(EventEmitter, {
  constructor: function (options) {
    options || (options = {});
    this.cache = {};
    this.paths = [];
    if (options.paths) this.addPaths(options.paths);
    if (options.path) this.addPaths(options.path);
    this.processors = _.extend({
      coffee: new engines.CoffeeScript(),
      eco: new engines.Eco(),
      jade: new engines.Jade(),
      jst: new engines.Jst(),
      styl: new engines.Stylus(),
      tmpl: new engines.Underscore()
    }, options.processors);
    this.compressors = options.compressors || {};
  },

  saveToDir: function (logical, dir, cb) {
    this.asset(logical, function (er, asset) {
      if (er) return cb(er);
      asset.saveToDir(dir, cb);
    });
  },

  saveAs: function (logical, target, cb) {
    this.asset(logical, function (er, asset) {
      if (er) return cb(er);
      asset.saveAs(target, cb);
    });
  },

  asset: function (logical, cb) {
    var self = this;
    this.abs(logical, function (er, abs) {
      if (er) return cb(er);
      cb(null, self.cache[abs] || (self.cache[abs] = new Asset(self, abs)));
    });
  },

  abs: function (logical, cb) {
    var self = this;
    var paths = this.paths;
    if (!paths.length) return cb(new Error('No env paths are defined'));
    var nextPath = function (i) {
      var dir = paths[i];
      if (!dir) return cb(new Error('Unable to match logical: ' + logical));
      var resolved = path.resolve(dir, logical);
      dir = path.dirname(resolved);
      var check = path.basename(resolved);
      fs.readdir(dir, function (er, files) {
        if (er) return nextPath(++i);
        var nextFile = function (j) {
          var file = files[j];
          if (!file) return nextPath(++i);
          var fileAbs = path.join(dir, file);
          fs.stat(fileAbs, function (er, stat) {
            if (er) return cb(er);
            var base = self.split(file).base;
            if (!stat.isDirectory() && (check === file || check === base)) {
              return cb(null, fileAbs);
            }
            nextFile(++j);
          });
        };
        nextFile(0);
      });
    };
    nextPath(0);
  },

  logical: function (abs, cb) {
    var paths = this.paths;
    var self = this;
    fs.stat(abs, function (er) {
      if (er) return cb(new Error('File does not exist: ' + abs));
      abs = path.resolve(path.dirname(abs), self.split(abs).base);
      for (var i = 0, l = paths.length; i < l; ++i) {
        var dir = paths[i];
        if (abs.indexOf(dir) === 0) return cb(null, abs.slice(dir.length + 1));
      }
      return cb(new Error('Unable to match abs: ' + abs));
    });
  },

  addPaths: function (dirs) {
    if (!_.isArray(dirs)) dirs = [dirs];
    this.paths = _.unique(this.paths.concat(_.map(dirs, path.resolve)));
  },

  split: function (abs) {
    var valid = ['js', 'css', 'html'].concat(_.keys(this.processors));
    var split = path.basename(abs).split('.');
    var exts = [];
    for (var i = split.length - 1; i > 0; --i) {
      var ext = split[i];
      if (!_.contains(valid, ext)) break;
      split.pop();
      exts.unshift(ext);
    }
    return {base: split.join('.'), exts: exts};
  }
});
