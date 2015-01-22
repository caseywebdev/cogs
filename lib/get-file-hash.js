var getHash = require('./get-hash');
var fs = require('fs');

module.exports = function (filePath, cb) {
  fs.readFile(filePath, 'utf8', function (er, source) {
    cb(null, er ? null : getHash(source));
  });
};
