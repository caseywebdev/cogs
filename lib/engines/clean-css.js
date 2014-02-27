'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  compress: function (asset, cb) {
    try {
      var cleanCss = require('clean-css');
      asset.compressed = cleanCss.process(asset.built);
      cb();
    }
    catch (er) {
      cb(er);
    }
  }
});
