'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');
var path = require('path');

module.exports = herit(Engine, {
  defaults: function () {
    return {
      dependencies: {},
      anonymous: true
    };
  },

  process: function (asset, cb) {
    var name = path.relative(asset.env.basePath, asset.relativeBase());
    asset.source =
      '(function (root, factory) {\n' +
      "  if (typeof define === 'function' && define.amd) {\n" +
      '    define(' + (this.options.anonymous ? '' : "'" + name + "', ") +
        '[' + this.dependencies('module', "'", "'") + '], factory);\n' +
      "  } else if (typeof exports !== 'undefined') {\n" +
      '    module.exports = factory(' +
        this.dependencies('module', "require('", "')") + ');\n' +
      '  } else {\n' +
      "    root['" + name + "'] = " +
        'factory(' + this.dependencies('variable', "root['", "']") + ");\n" +
      '  }\n' +
      '})(this, function (' + this.dependencies('variable') + ') {\n' +
      asset.source +
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
