var getHash = require('./get-hash');
var glob = require('glob');

module.exports = function (pattern, cb) {
  glob(pattern, {nodir: true}, function (er, files) {
    cb(null, er ? null : getHash(JSON.stringify(files)));
  });
};
