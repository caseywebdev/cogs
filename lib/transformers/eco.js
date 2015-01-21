var _ = require('underscore');
var eco = require('eco');
var to5 = require('./6to5');

module.exports = function (file, options, cb) {
  try {
    file = _.extend({}, file, {
      buffer: 'export default ' + eco.precompile(file.buffer.toString())
    });
    to5(file, {modules: 'umd'}, cb);
  } catch (er) { cb(er); }
};
