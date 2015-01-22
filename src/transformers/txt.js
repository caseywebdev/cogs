var _ = require('underscore');
var to5 = require('./6to5');

module.exports = function (file, options, cb) {
  try {
    var source =  'export default ' + JSON.stringify(file.buffer.toString());
    to5(_.extend({}, file, {buffer: new Buffer(source)}), {modules: 'umd'}, cb);
  } catch (er) { cb(er); }
};
