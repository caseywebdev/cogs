var _ = require('underscore');
var eco = require('eco');
var to5 = require('./6to5');

module.exports = function (file, options, cb) {
  try {
    to5(_.extend({}, file, {
      source: 'export default ' + eco.precompile(file.source)
    }), {modules: 'umd'}, cb);
  } catch (er) { cb(er); }
};
