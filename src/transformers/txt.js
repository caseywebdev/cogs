var _ = require('underscore');
var to5 = require('./6to5');

module.exports = function (file, options, cb) {
  try {
    to5(_.extend({}, file, {
      source: 'export default ' + JSON.stringify(file.source)
    }), {modules: 'umd'}, cb);
  } catch (er) { cb(er); }
};
