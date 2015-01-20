var getHash = require('./get-hash');
var glob = require('glob');

module.exports = function (pattern, cb) {
  glob(pattern, {nodir: true}, function (er, files) {
    if (er) return cb(er);
    cb(null, getHash(new Buffer(JSON.stringify(files))));
  });
};
