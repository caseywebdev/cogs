var _ = require('underscore');
var async = require('async');
var getCached = require('./get-cached');
var resolveBuild = require('./resolve-build');
var validateConfig = require('./validate-config');

module.exports = function (filePath, config, cb) {
  validateConfig(config || (config = {}));
  async.waterfall([
    _.partial(getCached, filePath, config.manifest),
    function (build, _cb) {
      if (_cb) return cb(null, build);
      resolveBuild(filePath, config, build);
    },
    function (build, cb) {
      cb(null, config.manifest[filePath] = build);
    },
  ], cb);
};
