var _ = require('underscore');
var async = require('async');
var config = require('./config');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var META_KEYS = ['__VERSION__', '__PIPE__'];

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
  if (!manifestPath) return cb(null, false);

  const data = JSON.stringify(pruneManifest(config.get().manifest));
  const checkEquality = _cb =>
    async.waterfall([
      _.partial(fs.readFile, manifestPath, 'utf8'),
      (existing, _cb) => data === existing ? cb(null, false) : _cb()
    ], _.bind(_cb, null));

  async.series([
    checkEquality,
    _.partial(mkdirp, path.dirname(manifestPath)),
    _.partial(fs.writeFile, manifestPath, data)
  ], _.partial(cb, _, true));
};
