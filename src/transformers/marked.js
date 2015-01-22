var marked = require('marked');

module.exports = function (file, options, cb) {
  try {
    var source = marked.setOptions(options)(file.buffer.toString());
    cb(null, {buffer: new Buffer(source)});
  } catch (er) { cb(er); }
};
