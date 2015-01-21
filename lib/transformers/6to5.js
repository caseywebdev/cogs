var _ = require('underscore');
var to5 = require('6to5');

module.exports = function (file, options, cb) {
  try {
    options = _.extend({filename: file.path}, options);
    cb(null, {
      buffer: new Buffer(to5.transform(file.buffer.toString(), options).code)
    });
  } catch (er) { cb(er); }
};