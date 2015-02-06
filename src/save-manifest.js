var _ = require('underscore');
var async = require('async');
var config = require('./config');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var META_KEYS = ['__VERSION__', '__IN__', '__TRANSFORMERS__'];

var pruneManifest = function (manifest) {
  return _.reduce(manifest, function (manifest, val, key) {
    if (_.include(META_KEYS, key)) {
      manifest[key] = val;
    } else if (val.targetPaths && val.hash) {
      manifest[key] = _.omit(val, 'buffer');
    }
    return manifest;
  }, {});
};

module.exports = function (cb) {
  var manifestPath = config.get().manifestPath;
  if (!manifestPath) return cb();
  async.series([
    _.partial(mkdirp, path.dirname(manifestPath)),
    _.partial(
      fs.writeFile,
      manifestPath,
      JSON.stringify(pruneManifest(config.get().manifest))
    )
  ], cb);
};
