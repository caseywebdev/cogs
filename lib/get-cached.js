var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getDependencyHashes = require('./get-dependency-hashes');
var getHash = require('./get-hash');

// Determine whether a cached file can be used or if it is potentially expired.
module.exports = function (filePath, cache, cb) {

  // First check if the necessary file information is in the cache.
  var file = cache[filePath];
  if (!file || !(file.buffer || (file.targetPaths && file.hash))) {
    return cb(null, null);
  }

  // Next validate the cache information.
  async.waterfall([
    function (_cb) {

      // If the file has a buffer, that means it's already been pulled into
      // memory, so it's safe to continue.
      if (file.buffer) return _cb();

      // Read the targetPaths and ensure a file exists that matches the
      // hash. If not, the cache is no good.
      async.map(file.targetPaths, function (targetPath, cb) {
        fs.readFile(targetPath, function (er, buffer) {
          if (er || getHash(buffer) !== file.hash) return cb();
          file.buffer = buffer;
          cb(null, targetPath);
        });
      }, function (er, targetPaths) {
        targetPaths = _.compact(targetPaths);
        if (targetPaths.length) {
          file.targetPaths = targetPaths;
          return _cb();
        }
        delete file.targetPaths;
        cb(null, null);
      });
    },

    // Check the current dependency hashes with those in the cache. If they
    // aren't equal, the cache is no good.
    _.partial(getDependencyHashes, file),
    function (hashes, cb) {
      var cachedHashes = _.pick(file, 'includes', 'links', 'globs');
      if (_.isEqual(hashes, cachedHashes)) return cb(null, file);
      delete cache[filePath];
      cb(null, null);
    }
  ], cb);
};
