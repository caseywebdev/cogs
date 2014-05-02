'use strict';

var Engine = require('./engine');
var herit = require('herit');
var path = require('path');

module.exports = herit(Engine, {
  defaults: function () {
    return {
      paths: []
    };
  },

  process: function (asset, cb) {
    try {
      var sass = require('node-sass');
      sass.render({
        data: asset.source,
        includePaths: this.options.paths.concat(path.dirname(asset.abs)),
        success: function (css) {
          asset.source = css;
          if (!asset.ext()) asset.exts.push('css');
          cb();
        },
        error: function (er) { cb(new Error(er)); }
      });
    } catch (er) { cb(er); }
  }
});
