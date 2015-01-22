var csso = require('csso');

module.exports = function (file, options, cb) {
  try {
    var source = csso.justDoIt(file.buffer.toString()) + '\n';
    cb(null, {buffer: new Buffer(source)});
  } catch (er) { cb(er); }
};
