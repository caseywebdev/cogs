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
      const wasUpdated = notSaved.length > 0;

      // Save the buffer to each targetPath that's not saved, and update
      // atime/mtime for each file that is already saved.
      async.waterfall([
        cb =>
          async.parallel([
            cb => {
              const now = Date.now() / 1000;
              async.each(saved, _.partial(fs.utimes, _, now, now), cb);
            },
            cb =>
              async.each(notSaved, (targetPath, cb) =>
                async.series([
                  _.partial(mkdirp, path.dirname(targetPath)),
                  _.partial(fs.writeFile, targetPath, build.buffer)
                ], cb)
              , cb)
          ], cb),
        (__, cb) => {
          build.targetPaths = targetPaths;
          cb(null, build, wasUpdated);
        }
      ], cb);
    }
  ], cb);
};
