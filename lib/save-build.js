var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getBuild = require('./get-build');
var getTargetPath = require('./get-target-path');
var mkdirp = require('mkdirp');
var path = require('path');
var saveManifest = require('./save-manifest');

module.exports = function (filePath, sourceGlob, targetDir, config, cb) {
  async.waterfall([
    _.partial(getBuild, filePath, config),
    function (build, cb) {
      var targetPath = getTargetPath(filePath, sourceGlob, targetDir, config);
      if (build.targetPath === targetPath) return cb(null, build);
      async.series([
        _.partial(mkdirp, path.dirname(targetPath)),
        _.partial(fs.writeFile, targetPath, build.buffer),
        function (cb) {
          build.targetPath = targetPath;
          cb();
        },
        _.partial(saveManifest, config),
        function () { cb(null, build); }
      ], cb);
    }
  ], cb);
};
