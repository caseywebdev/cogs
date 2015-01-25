var coffee = require('coffee-script');

module.exports = function (file, options, cb) {
  var source = file.buffer.toString();
  try { source = coffee.compile(source, options); }
  catch (er) { return cb(er); }
  cb(null, {buffer: new Buffer(source)});
};
