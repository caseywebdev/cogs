var crypto = require('crypto');

module.exports = function (source) {
  var hash = crypto.createHash('md5');
  hash.end(source);
  return hash.read().toString('hex');
};
