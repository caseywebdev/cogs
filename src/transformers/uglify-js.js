var _ = require('underscore');
var uglifyJs = require('uglify-js');

var DEFAULTS = {
  fromString: true
};

module.exports = function (file, options, cb) {
  var source = file.buffer.toString();
  options = _.extend({}, DEFAULTS, options);
  try { source = uglifyJs.minify(source, options).code + '\n'; }
  catch (er) { return cb(_.extend(new Error(), er)); }
  cb(null, {buffer: new Buffer(source)});
};
