'use strict';

var _ = require('underscore');
var Engine = require('./engine');

module.exports = _.inherit(Engine, {
  process: function (asset, cb) {
    try {
      var marked = require('marked');
      marked.setOptions(this.options);
      asset.raw = marked(asset.raw);
      if (asset.ext() !== 'html') asset.exts.push('html');
      cb();
    } catch (er) {
      cb(er);
    }
  }
});
