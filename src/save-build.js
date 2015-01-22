var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getBuild = require('./get-build');
var getTargetPath = require('./get-target-path');
var mkdirp = require('mkdirp');
var path = require('path');
var saveManifest = require('./save-manifest');

module.exports = function (filePath, sourceGlob, targets, cb) {
  async.waterfall([
    _.partial(getBuild, filePath),
    function (build, cb) {

      // Normalize targets array.
      if (!_.isArray(targets)) targets = [targets];

      // Extract targetPaths. If they match the targetPaths stored on `build`,
      // there's nothing to do.
      var iterator = _.partial(getTargetPath, build, sourceGlob);
      var targetPaths = _.map(targets, iterator);
      var notSaved = _.difference(targetPaths, build.targetPaths);
      if (!notSaved.length) return cb(null, build);

      // Save the buffer to each targetPath that's not in `build.targetPaths`.
      async.series([
        function (cb) {
          async.each(notSaved, function (targetPath, cb) {
            async.series([
              _.partial(mkdirp, path.dirname(targetPath)),
              _.partial(fs.writeFile, targetPath, build.buffer)
            ], cb);
          }, cb);
        },
        function (cb) {
          build.targetPaths = targetPaths;
          cb();
        },
        saveManifest,
        function () { cb(null, build); }
      ], cb);
    }
  ], cb);
};