'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  run: function (asset, cb) {
    try {
      var coffee = require('coffee-script');
      var options = _.extend({}, {filename: asset.abs}, this.options);
      asset.source = coffee.compile(asset.source, options);
      if (!asset.ext()) asset.exts.push('js');
    } catch (er) { return cb(er); }
    cb();
  }
});
