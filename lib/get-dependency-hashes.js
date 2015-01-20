var _ = require('underscore');
var async = require('async');
var getGlobHash = require('./get-glob-hash');
var getFileHash = require('./get-file-hash');

var zip = function (paths, cb, er, hashes) {
  cb(er, _.zip(paths, hashes));
};

var mapPaths = function (paths, iterator, cb) {
  async.map(paths, iterator, _.partial(zip, paths, cb));
};

module.exports = function (file, cb) {
  async.parallel({
    includes: _.partial(mapPaths, _.map(file.includes, 0), getFileHash),
    links: _.partial(mapPaths, _.map(file.links, 0), getFileHash),
    globs: _.partial(mapPaths, _.map(file.globs, 0), getGlobHash)
  }, cb);
};
