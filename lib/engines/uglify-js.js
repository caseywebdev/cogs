var _ = require('underscore');
var Engine = require('./engine');

module.exports = _.inherit(Engine, {
  compress: function (str, cb) {
    try {
      var uglifyJs = require('uglify-js');
      str = uglifyJs.minify(str, {fromString: true}).code;
      cb(null, str);
    } catch (er) {
      cb(er);
    }
  }
});
