var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getBuild = require('./get-build');
var getTargetPath = require('./get-target-path');
var mkdirp = require('mkdirp');
var path = require('path');
var toArray = require('./to-array');

module.exports = function (filePath, sourceGlob, targets, cb) {
  async.waterfall([
    _.partial(getBuild, filePath),
    function (build, wasUpdated, cb) {

      // Normalize targets array.
      targets = toArray(targets);

      // Extract targetPaths. If they match the targetPaths stored on `build`,
      // there's nothing to do.
      var iterator = _.partial(getTargetPath, build, sourceGlob);
      var targetPaths = _.map(targets, iterator);
      var saved = build.targetPaths || [];
      var notSaved = _.difference(targetPaths, saved);
      wasUpdated = notSaved.length > 0;

      // Save the buffer to each targetPath that's not saved, and update
      // atime/mtime for each file that is already saved.
      async.waterfall([
        function (cb) {
          async.parallel([
            function (cb) {
              var now = Date.now() / 1000;
              async.each(saved, _.partial(fs.utimes, _, now, now), cb);
            },
            function (cb) {
              async.each(notSaved, function (targetPath, cb) {
                async.series([
                  _.partial(mkdirp, path.dirname(targetPath)),
                  _.partial(fs.writeFile, targetPath, build.buffer)
                ], cb);
              }, cb);
            }
          ], cb);
        },
        function (__, cb) {
          build.targetPaths = targetPaths;
          cb(null, build, wasUpdated);
        }
      ], cb);
    }
  ], cb);
};
