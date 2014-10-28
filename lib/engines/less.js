'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  run: function (asset, cb) {
    try {
      require('less').render(asset.source, _.extend({
        paths: [asset.env.basePath],
        filename: asset.path
      }, this.options), function (er, css) {
        if (er) return cb(er);
        asset.source = css;

        // Add the `.css` extension if it's not already there
        if (!asset.ext()) asset.exts.push('css');
        cb();
      });
    } catch (er) { cb(er); }
  }
});
