var _ = require('underscore');
var async = require('async');
var getCached = require('./get-cached');
var resolveBuild = require('./resolve-build');
var validateConfig = require('./validate-config');
var cbQueue = require('./cb-queue');

module.exports = function (filePath, config, cb) {
  var cbQueueKey = [module.exports, filePath];
  if (cbQueue.push(config, cbQueueKey, cb)) return;
  async.waterfall([
    _.partial(validateConfig, config || (config = {})),
    function (cb) { getCached(filePath, config.manifest, cb); },
    function (build, cb) {
      if (build) return cb(null, build);
      async.waterfall([
        _.partial(resolveBuild, filePath, config),
        function (build, cb) { cb(null, config.manifest[filePath] = build); }
      ], cb);
    }
  ], _.partial(cbQueue.call, config, cbQueueKey));
};
