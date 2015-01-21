var _ = require('underscore');
var to5 = require('6to5');

module.exports = function (file, options, cb) {
  try {
    options = _.extend({filename: file.path}, options);
    var source = to5.transform(file.buffer.toString(), options).code + '\n';
    cb(null, {buffer: new Buffer(source)});
  } catch (er) { cb(er); }
};
