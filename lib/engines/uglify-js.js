'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  compress: function (asset, cb) {
    try {
      var uglifyJs = require('uglify-js');
      asset.compressed = uglifyJs.minify(asset.built, {fromString: true}).code;
    } catch (er) { return cb(er); }
    cb();
  }
});
