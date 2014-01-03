'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');
var path = require('path');

module.exports = herit(Engine, {
  defaults: function () {
    return {
      namespace: 'JST',
      dependencies: {},
      anonymous: true
    };
  },

  process: function (asset, cb) {
    var namespace = this.options.namespace && 'root.' + this.options.namespace;
    var name = path.relative(asset.env.basePath, asset.relativeBase());
    asset.source =
      '(function (root, factory) {\n' +
      "  if (typeof define === 'function' && define.amd) {\n" +
      '    define(' + (this.options.anonymous ? '' : "'" + name + "', ") +
        '[' + this.dependencies('module', "'", "'") + '], factory);\n' +
      '  }\n' +
      "  if (typeof exports !== 'undefined') {\n" +
      '    module.exports = factory(' +
        this.dependencies('module', "require('", "')") + ');\n' +
      '  }\n' + (namespace ?
      '  (' + namespace + ' || (' + namespace + ' = {}))' +
        "['" + name + "'] = factory(" +
        this.dependencies('variable', "root['", "']") + ");\n" : '') +
      '})(this, function (' + this.dependencies('variable') + ') {\n' +
      '  return (' + asset.source + ');\n' +
      '});\n';

    if (!asset.ext()) asset.exts.push('js');

    cb();
  },

  dependencies: function (type, prefix, suffix) {
    return _.map(this.options.dependencies, function (variable, module) {
      return (prefix || '') + (type === 'variable' ? variable : module) +
        (suffix || '');
    }).join(', ');
  }
});
