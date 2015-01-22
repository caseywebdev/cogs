var coffee = require('coffee-script');

module.exports = function (file, options, cb) {
  var source = coffee.compile(file.buffer.toString(), options);
  try { cb(null, {buffer: new Buffer(source)}); }
  catch (er) { cb(er); }
};
