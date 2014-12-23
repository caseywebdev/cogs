'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    modules: 'umd'
  },

  run: function (asset, cb) {
    try {
      var to5 = require('6to5');
      var options = _.extend({filename: asset.name}, this.options);
      asset.source = to5.transform(asset.source, options).code;
      if (!asset.ext()) asset.exts.push('js');
    } catch (er) { return cb(er); }
    cb();
  }
});
