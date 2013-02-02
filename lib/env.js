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
    if (options.paths) this.addPath(options.paths);
    if (options.path) this.addPath(options.path);
    this.processors = _.extend({
      coffee: new engines.CoffeeScript(),
      jade: new engines.Jade(),
      jst: new engines.Jst(),
      styl: new engines.Stylus(),
      underscore: new engines.Underscore()
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
    var highestPriority = Infinity;
    var abs = null;
    var paths = this.paths;
    var done = _.after(paths.length, function () {
      if (!paths.length) return cb(new Error('No env paths are defined'));
      if (!abs) return cb(new Error('Unable to match logical: ' + logical));
      cb(null, abs);
    });
    _.each(paths, function (dir, priority) {
      var check = path.resolve(dir, logical);
      dir = path.dirname(check);
      fs.readdir(dir, function (er, files) {
        if (er) return done();
        if (priority > highestPriority) return done();
        var base = path.basename(check);
        var file = _.find(files, function (file) {
          var dir = !~file.indexOf('.');
          return !dir && file === base || file.indexOf(base + '.') === 0;
        });
        if (!file) return done();
        abs = path.join(dir, file);
        highestPriority = priority;
        done();
      });
    });
  },

  logical: function (abs, cb) {
    var paths = this.paths;
    fs.stat(abs, function (er) {
      if (er) return cb(new Error('File does not exist: ' + abs));
      var base = path.basename(abs).replace(/\..*$/, '');
      abs = path.resolve(path.dirname(abs), base);
      var dir = _.find(paths, function (dir) {
        return abs.indexOf(dir) === 0;
      });
      if (!dir) return cb(new Error('Unable to match abs: ' + abs));
      cb(null, abs.slice(dir.length + 1));
    });
  },

  addPath: function (dirs) {
    if (!_.isArray(dirs)) dirs = [dirs];
    this.paths = _.unique(this.paths.concat(_.map(dirs, path.resolve)));
  }
});
