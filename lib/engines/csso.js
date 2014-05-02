'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  compress: function (asset, cb) {
    try {
      var csso = require('csso');
      asset.compressed = csso.justDoIt(asset.built);
    } catch (er) { return cb(er); }
    cb();
  }
});
