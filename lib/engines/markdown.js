'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  process: function (asset, cb) {
    try {
      var marked = require('marked');
      marked.setOptions(this.options);
      asset.source = marked(asset.source);
      if (!asset.ext()) asset.exts.push('html');
      cb();
    } catch (er) {
      cb(er);
    }
  }
});
