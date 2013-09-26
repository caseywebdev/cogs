'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  compress: function (str, cb) {
    try { cb(null, require('uglify-js').minify(str, {fromString: true}).code); }
    catch (er) { cb(er); }
  }
});
