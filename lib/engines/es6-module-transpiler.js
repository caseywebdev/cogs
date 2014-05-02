'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    exporter: 'toAMD',
    anonymous: true
  },

  process: function (asset, cb) {
    try {
      var Compiler = require('es6-module-transpiler').Compiler;
      var name = this.options.anonymous ? null : asset.name;
      var compiler = new Compiler(asset.source, name, this.options);
      asset.source = compiler[this.options.exporter]();
      if (!asset.ext()) asset.exts.push('js');
    } catch (er) { return cb(er); }
    cb();
  }
});
