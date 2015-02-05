var _ = require('underscore');
var eco = require('eco');
var to5 = require('cogs-transformer-6to5');

var DEFAULTS = {
  modules: 'umd'
};

module.exports = function (file, options, cb) {
  var source = file.buffer.toString();
  options = _.extend({}, DEFAULTS, options);
  try { source = 'export default ' + eco.precompile(source); }
  catch (er) { return cb(new Error(er)); }
  to5(_.extend({}, file, {buffer: new Buffer(source)}), options, cb);
};
