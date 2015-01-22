var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getBuild = require('./get-build');
var getTargetPath = require('./get-target-path');
var mkdirp = require('mkdirp');
var path = require('path');
var saveManifest = require('./save-manifest');
var cbQueue = require('./cb-queue');

module.exports = function (filePath, sourceGlob, targets, config, cb) {
  var cbQueueKey = [module.exports, filePath, sourceGlob, targets];
  if (cbQueue.push(config, cbQueueKey, cb)) return;
  async.waterfall([
    _.partial(getBuild, filePath, config),
    function (build, cb) {

      // Normalize targets array.
      if (!_.isArray(targets)) targets = [targets];

      // Extract targetPaths. If they match the targetPaths stored on `build`,
      // there's nothing to do.
      var iterator = _.partial(getTargetPath, build, sourceGlob, _, config);
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
        _.partial(saveManifest, config),
        function () { cb(null, build); }
      ], cb);
    }
  ], _.partial(cbQueue.call, config, cbQueueKey));
};
