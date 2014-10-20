'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  run: function (asset, cb) {
    try {
      var csso = require('csso');
      asset.source = csso.justDoIt(asset.source);
    } catch (er) { return cb(er); }
    cb();
  }
});
