var _ = require('underscore');
var getDependencyHashes = require('./get-dependency-hashes');

module.exports = function (filePath, cache, cb) {
  var file = cache[filePath];
  if (!file) return cb();
  getDependencyHashes(file, function (er, hashes) {
    if (er) return cb(er);
    var cachedHashes = _.pick(file, 'includes', 'links', 'globs');
    if (_.isEqual(hashes, cachedHashes)) return cb(null, file);
    delete cache[filePath];
    cb();
  });
};
