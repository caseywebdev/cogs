'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: function () {
    return {
      anonymous: true
    };
  },

  process: function (asset, cb) {
    var global = asset.shim.global;
    var dependencies = _.map(asset.shim.dependencies, function (module) {
      return "'" + module + "'";
    }).join(', ');
    asset.source +=
      '\n' +
      '(function (root) {\n' +
      "  var value = root['" + global + "'];\n" +
      "  if (typeof define === 'function' && define.amd) {\n" +
      '    define(' +
        (this.options.anonymous ? '' : "'" + asset.name + "', ") +
        '[' + dependencies + '], function () { return value; });\n' +
      "  } else if (typeof exports !== 'undefined') {\n" +
      '    module.exports = value;\n' +
      '  }\n' +
      '})(this);\n';
    if (!asset.ext()) asset.exts.push('js');
    cb();
  }
});
