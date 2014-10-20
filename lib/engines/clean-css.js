'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  run: function (asset, cb) {
    try {
      var cleanCss = require('clean-css');
      asset.source = cleanCss.process(asset.source);
    } catch (er) { return cb(er); }
    cb();
  }
});
