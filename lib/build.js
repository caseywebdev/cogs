var fs = require('fs');
var getFile = require('./get-file');
var path = require('path');

var CACHE =

module.exports = function (filePath, options, cb) {
  filePath = path.resolve(filePath);
  fs.readFile(filePath, function (er, data) {
    if (er) return cb(er);
    cb(null, {data: data, hash: getHash(data)});
  });
};
