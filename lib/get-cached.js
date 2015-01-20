var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getDependencyHashes = require('./get-dependency-hashes');
var getHash = require('./get-hash');

// Determine whether a cached file can be used or if it is potentially expired.
module.exports = function (filePath, cache, cb) {

  // First check if any file information is in the cache.
  var file = cache[filePath];
  if (!file) return cb();

  async.waterfall([
    function (_cb) {

      // If the file has a buffer, that means it's already been pulled into
      // memory, so it's save to continue.
      if (file.buffer) return _cb();

      // If there's no buffer and no targetPath/hash combination, the
      // cache is no good.
      if (!file.targetPath || !file.hash) return cb();

      // Read the targetPath and ensure the file exists and matches the
      // hash. If not, the cache is no good.
      fs.readFile(file.targetPath, function (er, buffer) {
        er || getHash(file.buffer = buffer) === file.hash ? _cb() : cb();
      });
    },

    // Check the current dependency hashes with those in the cache. If they
    // aren't equal, the cache is no good.
    _.partial(getDependencyHashes, file),
    function (hashes, cb) {
      var cachedHashes = _.pick(file, 'includes', 'links', 'globs');
      if (_.isEqual(hashes, cachedHashes)) return cb(null, file);
      delete cache[filePath];
      cb();
    }
  ], cb);
};
