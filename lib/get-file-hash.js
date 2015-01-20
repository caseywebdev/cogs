var getHash = require('./get-hash');
var fs = require('fs');

module.exports = function (filePath, cb) {
  fs.readFile(filePath, function (er, buffer) {
    cb(null, er ? null : getHash(buffer));
  });
};
