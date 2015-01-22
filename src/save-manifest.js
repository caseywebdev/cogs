var _ = require('underscore');
var async = require('async');
var config = require('./config');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var memoize = require('./memoize');

var pruneManifest = function (manifest) {
  return _.reduce(manifest, function (manifest, val, key) {
    if (key === '__VERSION__' || key === '__IN__') {
      manifest[key] = val;
    } else if (val.targetPaths && val.hash) {
      manifest[key] = _.omit(val, 'source');
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
    ),
    function () {
      _.each(memoize.caches, function (cache) {
        _.each(cache, function (__, key) {
          if (key === manifestPath) delete cache[key];
        });
      });
      cb();
    }
  ], cb);
};
