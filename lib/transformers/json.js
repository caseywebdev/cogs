var _ = require('underscore');
var to5 = require('./6to5');

module.exports = function (file, options, cb) {
  try {
    var source = 'export default ' + file.buffer.toString();
    file = _.extend({}, file, {buffer: new Buffer(source)});
    to5(file, {modules: 'umd'}, cb);
  } catch (er) { cb(er); }
};
