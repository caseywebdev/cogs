var _ = require('underscore');
var async = require('async');
var getGlobHash = require('./get-glob-hash');
var getFileHash = require('./get-file-hash');

var mapPaths = function (paths, getHash, cb) {
  async.map(paths, function (filePath, cb) {
    getHash(filePath, function (hash) {
      cb(null, {path: filePath, hash: hash});
    });
  }, cb);
};

module.exports = function (file, cb) {
  async.parallel({
    includes: _.partial(mapPaths, _.map(file.includes, 'path'), getFileHash),
    links: _.partial(mapPaths, _.map(file.links, 'path'), getFileHash),
    globs: _.partial(mapPaths, _.map(file.globs, 'path'), getGlobHash)
  }, cb);
};
