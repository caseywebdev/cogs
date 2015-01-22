var _ = require('underscore');
var uglifyJs = require('uglify-js');

var DEFAULTS = {
  fromString: true
};

module.exports = function (file, options, cb) {
  try {
    console.log(file.path);
    options = _.extend({}, DEFAULTS, options);
    cb(null, {source: uglifyJs.minify(file.source, options).code + '\n'});
  } catch (er) { cb(er); }
};
