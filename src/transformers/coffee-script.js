var coffee = require('coffee-script');

module.exports = function (file, options, cb) {
  try { cb(null, {source: coffee.compile(file.source, options)}); }
  catch (er) { cb(er); }
};
