'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  process: function (asset, cb) {
    try {
      var ReactTools = require('react-tools');
      asset.source = ReactTools.transform(asset.source);
      if (!asset.ext()) asset.exts.push('js');
      cb();
    } catch (er) {
      cb(er);
    }
  }
});
