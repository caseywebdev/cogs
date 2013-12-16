'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    namespace: 'JST'
  },

  process: function (asset, cb) {
    var namespace = this.options.namespace && 'root.' + this.options.namespace;
    var name = asset.relativeBase();
    asset.source =
      '(function (root, factory) {\n' +
      "  if (typeof define === 'function' && define.amd) {\n" +
      "    define('" + name + "', [], factory);\n" +
      "  } else if (typeof exports !== 'undefined') {\n" +
      '    module.exports = factory();\n' +
      '  }\n' + (namespace ?
      '  (' + namespace + ' || (' + namespace + ' = {}))' +
        "['" + name + "'] = factory();\n" : '') +
      '})(this, function () {\n' +
      '  return ' + asset.source + ';\n' +
      '});\n';

    if (!asset.ext()) asset.exts.push('js');

    cb();
  }
});
