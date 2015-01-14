'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');
var path = require('path');

module.exports = herit(Engine, {
  defaults: function () {
    return {
      includePaths: [],
      indentedSyntax: false
    };
  },

  run: function (asset, cb) {
    try {
      var sass = require('node-sass');
      sass.render(_.extend({}, this.options, {
        data: asset.source,
        includePaths: this.options.includePaths.concat(path.dirname(asset.abs)),
        success: function (res) {
          asset.source = res.css;
          if (!asset.ext()) asset.exts.push('css');
          cb();
        },
        error: function (er) {
          cb(new Error('Line ' + er.line + ': ' + er.message));
        }
      }));
    } catch (er) { cb(er); }
  }
});
