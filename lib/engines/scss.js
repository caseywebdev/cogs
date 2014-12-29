'use strict';

var Engine = require('./engine');
var herit = require('herit');
var path = require('path');

module.exports = herit(Engine, {
  defaults: function () {
    return {
      paths: [],
      indentedSyntax: false
    };
  },

  run: function (asset, cb) {
    try {
      var sass = require('node-sass');
      sass.render({
        data: asset.source,
        indentedSyntax: this.options.indentedSyntax,
        includePaths: this.options.paths.concat(path.dirname(asset.abs)),
        success: function (res) {
          asset.source = res.css;
          if (!asset.ext()) asset.exts.push('css');
          cb();
        },
        error: function (er) { cb(new Error(er)); }
      });
    } catch (er) { cb(er); }
  }
});
