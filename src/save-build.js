var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getBuild = require('./get-build');
var getTargetPath = require('./get-target-path');
var mkdirp = require('mkdirp');
var path = require('path');

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
      var saved = build.targetPaths || [];
      var notSaved = _.difference(targetPaths, saved);

      // Save the buffer to each targetPath that's not saved, and update
      // atime/mtime for each file that is already saved.
      async.series([
        function (cb) {
          async.parallel([
            function () {
              var epoch = Date.now() / 1000;
              async.each(saved, _.partial(fs.utimes, _, epoch, epoch), cb);
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
        function (cb) {
          build.targetPaths = targetPaths;
          cb();
        },
        function () { cb(null, build); }
      ], cb);
    }
  ], cb);
};
