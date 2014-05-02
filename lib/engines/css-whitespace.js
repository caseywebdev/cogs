'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  process: function (asset, cb) {
    try {
      var cssWhitespace = require('css-whitespace');
      asset.source = cssWhitespace(asset.source);
      if (!asset.ext()) asset.exts.push('css');
    } catch (er) { return cb(er); }
    cb();
  }
});
