var _ = require('underscore');
var uglifyJs = require('uglify-js');

var DEFAULTS = {
  fromString: true,
  ignore: []
};

module.exports = function (file, options, cb) {
  try {
    options = _.extend({}, DEFAULTS, options);
    if (_.contains(options.ignore, file.path)) return cb(null, {});
    var source = uglifyJs.minify(file.buffer.toString(), options).code + '\n';
    cb(null, {buffer: new Buffer(source)});
  } catch (er) { cb(er); }
};
