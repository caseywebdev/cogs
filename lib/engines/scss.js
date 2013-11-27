'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  process: function (asset, cb) {
    try {
      var sass = require('node-sass');
      sass.render({
        data: asset.raw,
        includePaths: asset.env.paths,
        success: function (css) {
          asset.raw = css;
          if (asset.ext() !== 'css') asset.exts.push('css');
          cb();
        },
        error: function (er) { cb(new Error(er)); }
      });
    } catch (er) {
      cb(er);
    }
  }
});
