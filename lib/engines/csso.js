var _ = require('underscore');
var Engine = require('./engine');

module.exports = _.inherit(Engine, {
  compress: function (str, cb) {
    try { cb(null, require('csso').justDoIt(str)); }
    catch (er) { cb(er); }
  }
});
