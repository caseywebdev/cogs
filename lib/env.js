'use strict';

var _ = require('underscore');
var Asset = require('./asset');
var async = require('async');
var engines = require('./engines');
var fs = require('fs');
var path = require('path');

module.exports = _.inherit(require('events').EventEmitter, {
  constructor: function (options) {
    options || (options = {});
    this.cache = {};
    this.paths = [];
    this.fingerprints = {};
    this.algorithm = options.algorithm || 'md5';
    if (options.paths) this.addPaths(options.paths);
    if (options.path) this.addPaths(options.path);
    this.processors = _.extend({
      coffee: new engines.CoffeeScript(),
      eco: new engines.Eco(),
      jade: new engines.Jade(),
      jst: new engines.Jst(),
      md: new engines.Markdown(),
      sass: new engines.Sass(),
      scss: new engines.Scss(),
      styl: new engines.Stylus(),
      tmpl: new engines.Underscore()
    }, options.processors);
    this.compressors = options.compressors || {};
  },

  addPaths: function (dirs) {
    if (!_.isArray(dirs)) dirs = [dirs];
    var resolve = function (dir) { return path.resolve(dir); };
    this.paths = _.unique(this.paths.concat(_.map(dirs, resolve)));
    return this;
  },

  split: function (abs) {
    var valid = _.keys(this.processors);
    var split = path.basename(abs).split('.');
    var exts = [];
    for (var i = split.length - 1; i > 0; --i) {
      var ext = split[i];
      split.pop();
      exts.unshift(ext);
      if (!_.contains(valid, ext)) break;
    }
    return {base: split.join('.'), exts: exts};
  },

  abs: function (logical, cb) {
    var done = cb;
    var self = this;
    async.eachSeries(this.paths, function (dir, cb) {
      var resolved = path.resolve(dir, logical);
      dir = path.dirname(resolved);
      var check = path.basename(resolved);
      fs.readdir(dir, function (er, files) {
        if (er) return cb();
        async.eachSeries(files, function (file, cb) {
          var fileAbs = path.join(dir, file);
          fs.stat(fileAbs, function (er, stat) {
            if (er) return cb(er);
            var base = self.split(file).base;
            var isMatch = check === file || check === base;
            if (!stat.isDirectory() && isMatch) return done(null, fileAbs);
            cb();
          });
        }, cb);
      });
    }, function (er) {
      cb(er || new Error('Unable to match logical: ' + logical));
    });
    return this;
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
    return this;
  },

  asset: function (logical, cb) {
    var self = this;
    return this.abs(logical, function (er, abs) {
      if (er) return cb(er);
      cb(null, self.cache[abs] || (self.cache[abs] = new Asset(self, abs)));
    });
  },

  end: function () { this.emit('end'); }
});
