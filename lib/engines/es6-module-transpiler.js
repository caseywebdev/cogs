'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    exporter: 'toAMD'
  },

  process: function (asset, cb) {
    var Compiler = require("es6-module-transpiler").Compiler;
    var name = asset.relativeBase();
    var compiler = new Compiler(asset.source, name, this.options);
    asset.source = compiler[this.options.exporter]();
    if (!asset.ext()) asset.exts.push('js');
    cb();
  }
});
