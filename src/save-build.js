const _ = require('underscore');
const async = require('async');
const fs = require('fs');
const getBuild = require('./get-build');
const getTargetPaths = require('./get-target-paths');
const mkdirp = require('mkdirp');
const path = require('path');
const toArray = require('./to-array');

module.exports = (filePath, sourceGlob, targets, cb) => {
  async.waterfall([
    _.partial(getBuild, filePath),
    (build, __, cb) => {

      // Extract targetPaths. If they match the targetPaths stored on `build`,
      // there's nothing to do.
      async.waterfall([
        _.partial(
          async.map,
          toArray(targets),
          _.partial(getTargetPaths, build, sourceGlob)
        ),
        (targetPaths, cb) => cb(null, _.compact(_.flatten(targetPaths)))
      ], _.partial(cb, _, build));
    },
    (build, targetPaths, cb) => {
      const saved = build.targetPaths || [];
      const notSaved = _.difference(targetPaths, saved);
      if (!notSaved.length) return cb(null, build, false);

      const saveTarget = (targetPath, cb) =>
        async.series([
          _.partial(mkdirp, path.dirname(targetPath)),
          _.partial(fs.writeFile, targetPath, build.buffer)
        ], cb);

      // Save the buffer to each targetPath that's not saved.
      async.waterfall([
        _.partial(async.each, notSaved, saveTarget),
        cb => {
          build.targetPaths = targetPaths;
          cb(null, build, true);
        }
      ], cb);
    }
  ], cb);
};
