var _ = require('underscore');
var csso = require('csso');

var DEFAULTS = {
  ignore: []
};

module.exports = function (file, options, cb) {
  try {
    options = _.extend({}, DEFAULTS, options);
    if (_.contains(options.ignore, file.path)) return cb(null, {});
    var source = csso.justDoIt(file.buffer.toString()) + '\n';
    cb(null, {buffer: new Buffer(source)});
  } catch (er) { cb(er); }
};
