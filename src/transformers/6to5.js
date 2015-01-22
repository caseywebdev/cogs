var _ = require('underscore');
var to5 = require('6to5');

module.exports = function (file, options, cb) {
  try {
    options = _.extend({filename: file.path}, options);
    cb(null, {source: to5.transform(file.source, options).code + '\n'});
  } catch (er) { cb(er); }
};
