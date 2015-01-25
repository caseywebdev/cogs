var _ = require('underscore');
var async = require('async');
var getDependencyHashes = require('./get-dependency-hashes');
var getHash = require('./get-hash');
var config = require('./config');
var readFile = require('./read-file');

// Determine whether a cached build can be used or if it is potentially expired.
module.exports = function (filePath, cb) {

  // First check if the necessary build information is in the manifest.
  var build = config.get().manifest[filePath];
  if (!build || !(build.buffer || (build.targetPaths && build.hash))) {
    return cb(null, null);
  }

  // Next validate the manifest information.
  async.waterfall([
    function (_cb) {

      // If the build has a buffer, that means it's already been pulled into
      // memory, so it's safe to continue.
      if (build.buffer) return _cb();

      // Read the targetPaths and ensure a build exists that matches the
      // hash. If not, the manifest is no good.
      async.map(build.targetPaths, function (targetPath, cb) {
        readFile(targetPath, function (er, buffer) {
          if (er || getHash(buffer) !== build.hash) return cb();
          build.buffer = buffer;
          cb(null, targetPath);
        });
      }, function (er, targetPaths) {
        targetPaths = _.compact(targetPaths);
        if (targetPaths.length) {
          build.targetPaths = targetPaths;
          return _cb();
        }
        delete build.targetPaths;
        cb(null, null);
      });
    },

    // Check the current dependency hashes with those in the manifest. If they
    // aren't equal, the manifest is no good.
    _.partial(getDependencyHashes, build),
    function (hashes, cb) {
      var cachedHashes = _.pick(build, 'requires', 'links', 'globs');
      if (_.isEqual(hashes, cachedHashes)) return cb(null, build);
      delete config.get().manifest[filePath];
      cb(null, null);
    }
  ], cb);
};
