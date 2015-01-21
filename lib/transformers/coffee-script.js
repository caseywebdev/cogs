var coffee = require('coffee-script');

module.exports = function (file, options, cb) {
  try {
    cb(null, {
      buffer: new Buffer(coffee.compile(file.buffer.toString(), options))
    });
  } catch (er) { cb(er); }
};
