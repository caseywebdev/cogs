'use strict';

var _ = require('underscore');
var Engine = require('./engine');

module.exports = _.inherit(Engine, {
  compress: function (str, cb) {
    try { cb(null, require('uglify-js').minify(str, {fromString: true}).code); }
    catch (er) { cb(er); }
  }
});
