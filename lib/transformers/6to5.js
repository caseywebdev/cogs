var _ = require('underscore');

module.exports = function (source, file, options, cb) {
  try {
    options = _.extend({filename: file.path}, options);
    cb(null, require('6to5').transform(source, options).code);
  } catch (er) { cb(er); }
};
