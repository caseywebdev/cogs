var _ = require('underscore');
var async = require('async');
var config = require('./config');
var getCachedBuild = require('./get-cached-build');
var resolveBuild = require('./resolve-build');

module.exports = function (filePath, cb) {
  async.waterfall([
    _.partial(getCachedBuild, filePath),
    function (build, cb) {
      if (build) return cb(null, build);
      async.waterfall([
        _.partial(resolveBuild, filePath),
        function (build, cb) {
          cb(null, config.get().manifest[filePath] = build);
        }
      ], cb);
    }
  ], cb);
};
