const _ = require('underscore');
const async = require('async');
const config = require('./config');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const META_KEYS = new Set(['__VERSION__', '__PIPE__']);

const pruneManifest = manifest =>
  _.reduce(manifest, (manifest, val, key) => {
    if (META_KEYS.has(key)) manifest[key] = val;
    else if (val.targetPaths && val.hash) manifest[key] = _.omit(val, 'buffer');
    return manifest;
  }, {});

module.exports = cb => {
  const manifestPath = config.get().manifestPath;
  if (!manifestPath) return cb(null, false);

  const data = JSON.stringify(pruneManifest(config.get().manifest));
  const checkEquality = _cb =>
    async.waterfall([
      _.partial(fs.readFile, manifestPath, 'utf8'),
      (existing, _cb) => {
        try {
          existing = JSON.parse(existing);
          if (_.isEqual(JSON.parse(data), existing)) return cb(null, false);
        } catch (er) {}
        _cb();
      }
    ], _.partial(_cb, null));

  async.series([
    checkEquality,
    _.partial(mkdirp, path.dirname(manifestPath)),
    _.partial(fs.writeFile, manifestPath, data)
  ], _.partial(cb, _, true));
};
