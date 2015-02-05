var _ = require('underscore');
var to5 = require('cogs-transformer-6to5');

var DEFAULTS = {
  modules: 'umd'
};

module.exports = function (file, options, cb) {
  var source = file.buffer.toString();

  // Validate JSON.
  try { JSON.parse(source); } catch (er) { return cb(er); }

  source = 'export default ' + source;
  options = _.extend({}, DEFAULTS, options);
  to5(_.extend({}, file, {buffer: new Buffer(source)}), options, cb);
};
