var marked = require('marked');

module.exports = function (file, options, cb) {
  try { cb(null, {source: marked.setOptions(options)(file.source)}); }
  catch (er) { cb(er); }
};
