var csso = require('csso');

module.exports = function (file, options, cb) {
  try { cb(null, {source: csso.justDoIt(file.source) + '\n'}); }
  catch (er) { cb(er); }
};
