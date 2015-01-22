var _ = require('underscore');

var DEFAULTS = {
  before: '',
  after: ''
};

module.exports = function (file, options, cb) {
  options = _.extend({}, DEFAULTS, options);
  var source =  options.before + file.path + options.after + '\n' +
    file.buffer.toString();
  cb(null, {buffer: new Buffer(source)});
};
