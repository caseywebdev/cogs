'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  compress: function (asset, cb) {
    try {
      var uglifyJs = require('uglify-js');
      var options = _.extend({fromString: true}, this.options);
      asset.compressed = uglifyJs.minify(asset.built, options).code;
    } catch (er) { return cb(er); }
    cb();
  }
});
