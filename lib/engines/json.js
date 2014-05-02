'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  process: function (asset, cb) {
    asset.source = 'return ' + asset.source.trim() + ';\n';
    if (!asset.ext()) asset.exts.push('umd');
    cb();
  }
});
