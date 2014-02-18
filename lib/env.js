'use strict';

var _ = require('underscore');
var Asset = require('./asset');
var engines = require('./engines');
var herit = require('herit');
var path = require('path');

module.exports = herit(require('events').EventEmitter, {
  constructor: function (options) {
    options || (options = {});
    this.cache = {};
    this.fingerprints = {};
    this.algorithm = options.algorithm || 'md5';
    this.basePath = options.basePath || '.';
    this.processors = _.extend({
      coffee: new engines.CoffeeScript(),
      eco: new engines.Eco(),
      es6: new engines.Es6ModuleTranspiler(),
      jade: new engines.Jade(),
      jst: new engines.Umd(),
      jsx: new engines.Jsx(),
      less: new engines.Less(),
      md: new engines.Markdown(),
      mustache: new engines.Mustache(),
      rwk: new engines.Rework(),
      sass: new engines.Sass(),
      scss: new engines.Scss(),
      styl: new engines.Stylus(),
      tmpl: new engines.Underscore(),
      umd: new engines.Umd()
    }, options.processors);
    this.compressors = options.compressors || {};
  },

  split: function (abs) {
    var split = path.basename(abs).split('.');
    var exts = [];
    for (var i = split.length - 1; i > 0; --i) {
      var ext = split[i];
      split.pop();
      exts.unshift(ext);
      if (!this.processors[ext]) break;
    }
    return {base: split.join('.'), exts: exts};
  },

  asset: function (relative) {
    var abs = path.resolve(relative);
    return this.cache[abs] || (this.cache[abs] = new Asset(this, abs));
  }
});
