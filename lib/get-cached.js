var _ = require('underscore');
var async = require('async');
var getDependencyHashes = require('./get-dependency-hashes');
var getHash = require('./get-hash');
var readFile = require('./read-file');

// Determine whether a cached file can be used or if it is potentially expired.
module.exports = function (filePath, cache, cb) {

  // First check if the necessary file information is in the cache.
  var file = cache[filePath];
  if (!file || !(file.source || (file.targetPaths && file.hash))) {
    return cb(null, null);
  }

  // Next validate the cache information.
  async.waterfall([
    function (_cb) {

      // If the file has a source, that means it's already been pulled into
      // memory, so it's safe to continue.
      if (file.source) return _cb();

      // Read the targetPaths and ensure a file exists that matches the
      // hash. If not, the cache is no good.
      async.map(file.targetPaths, function (targetPath, cb) {
        readFile(targetPath, function (er, source) {
          if (er || getHash(source) !== file.hash) return cb();
          file.source = source;
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
