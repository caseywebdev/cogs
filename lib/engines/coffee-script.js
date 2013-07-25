'use strict';

var _ = require('underscore');
var Engine = require('./engine');

module.exports = _.inherit(Engine, {
  process: function (asset, cb) {
    try {
      var coffee = require('coffee-script');
      var options = _.extend({}, {filename: asset.abs}, this.options);
      asset.raw = coffee.compile(asset.raw, options);
      if (asset.ext() !== 'js') asset.exts.push('js');
      cb();
    } catch (er) {
      cb(er);
    }
  }
});
