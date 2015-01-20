var fs = require('fs');
var getTransformed = require('./get-transformed');
var getCached = require('./get-cached');

module.exports = function (filePath, config, cb) {
  getCached(filePath, config.files, function (er, file) {
    if (er) return cb(er);
    if (file) return cb(null, file);
    fs.readFile(filePath, function (er, buffer) {
      if (er) return cb(er);
      getTransformed({
        path: filePath,
        buffer: buffer,
        includes: [filePath],
        links: [],
        globs: []
      }, config, cb);
    });
  });
};
