'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  compress: function (str, cb) {
    try { cb(null, require('csso').justDoIt(str)); }
    catch (er) { cb(er); }
  }
});
