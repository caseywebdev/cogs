var marked = require('marked');

module.exports = function (file, options, cb) {
  var source = marked.setOptions(options)(file.buffer.toString());
  cb(null, {buffer: new Buffer(source)});
};
