var crypto = require('crypto');

module.exports = function (buffer) {
  var hash = crypto.createHash('md5');
  hash.end(buffer);
  return hash.read().toString('hex');
};
