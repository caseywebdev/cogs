var getHash = require('./get-hash');
var glob = require('glob');
var memoize = require('./memoize');

module.exports = memoize(function (pattern, cb) {
  glob(pattern, {nodir: true}, function (er, files) {
    if (er) return cb(er);
    cb(null, getHash(JSON.stringify(files)));
  });
});
