var getHash = require('./get-hash');
var memoize = require('./memoize');
var readFile = require('./read-file');

module.exports = memoize(function (filePath, cb) {
  readFile(filePath, function (er, source) {
    cb(null, er ? null : getHash(source));
  });
});
