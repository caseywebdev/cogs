var _ = require('underscore');
var async = require('async');
var getGlobHash = require('./get-glob-hash');
var getFileHash = require('./get-file-hash');

var mapPaths = function (paths, getHash, cb) {
  async.map(paths, function (filePath, cb) {
    async.waterfall([
      _.partial(getHash, filePath),
      function (hash, cb) { cb(null, {path: filePath, hash: hash}); }
    ], cb);
  }, cb);
};

module.exports = function (build, cb) {
  async.parallel({
    requires: _.partial(mapPaths, _.map(build.requires, 'path'), getFileHash),
    links: _.partial(mapPaths, _.map(build.links, 'path'), getFileHash),
    globs: _.partial(mapPaths, _.map(build.globs, 'path'), getGlobHash)
  }, cb);
};
