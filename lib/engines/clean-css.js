var _ = require('underscore');
var Engine = require('./engine');

module.exports = _.inherit(Engine, {
  compress: function (str, cb) {
    try {
      var cleanCss = require('clean-css');
      str = cleanCss.process(str);
      cb(null, str);
    } catch (er) {
      cb(er);
    }
  }
});
