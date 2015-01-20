var _ = require('underscore');

var DEFAULTS = {
  before: '',
  after: ''
};

module.exports = function (file, options, cb) {
  options = _.extend({}, DEFAULTS, options);
  cb(null, {
    buffer: Buffer.concat([
      new Buffer(options.before + file.path + options.after + '\n'),
      file.buffer
    ])
  });
};
