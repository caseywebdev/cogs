var _ = require('underscore');
var getDependencyHashes = require('./get-dependency-hashes');

module.exports = function (filePath, cache, cb) {
  var file = cache[filePath];
  if (!file) return cb();
  var cachedHashes = _.pick(file, 'includes', 'links', 'globs');
  file = _.extend({}, file, {
    includes: _.keys(file.includes),
    links: _.keys(file.links),
    globs: _.keys(file.globs)
  });
  getDependencyHashes(file, function (er, hashes) {
    if (er) return cb(er);
    if (_.isEqual(hashes, cachedHashes)) return cb(null, file);
    delete cache[filePath];
    cb();
  });
};
