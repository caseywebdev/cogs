var _ = require('underscore');
var to5 = require('6to5');

module.exports = function (file, options, cb) {
  var source = file.buffer.toString();
  options = _.extend({filename: file.path}, options);
  try { source = to5.transform(source, options).code + '\n'; }
  catch (er) { return cb(er); }
  cb(null, {buffer: new Buffer(source)});
};
