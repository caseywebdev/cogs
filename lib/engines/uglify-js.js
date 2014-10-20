'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  run: function (asset, cb) {
    try {
      var uglifyJs = require('uglify-js');
      var options = _.extend({fromString: true}, this.options);
      asset.source = uglifyJs.minify(asset.source, options).code;
    } catch (er) { return cb(er); }
    cb();
  }
});
