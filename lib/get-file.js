var fs = require('fs');
var getHash = require('./get-hash');
var path = require('path');

module.exports = function (filePath, cb) {
  filePath = path.resolve(filePath);
  fs.readFile(filePath, function (er, data) {
    if (er) return cb(er);
    cb(null, {data: data, hash: getHash(data)});
  });
};
