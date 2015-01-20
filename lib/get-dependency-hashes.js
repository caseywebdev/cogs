var _ = require('underscore');
var async = require('async');
var getGlobHash = require('./get-glob-hash');
var getFileHash = require('./get-file-hash');

var objZip = function (paths, cb, er, hashes) {
  cb(er, _.object(paths, hashes));
};

var mapPaths = function (paths, iterator, cb) {
  async.map(paths, iterator, _.partial(objZip, paths, cb));
};

module.exports = function (file, cb) {
  async.parallel({
    includes: _.partial(mapPaths, file.includes, getFileHash),
    links: _.partial(mapPaths, file.links, getFileHash),
    globs: _.partial(mapPaths, file.globs, getGlobHash)
  }, cb);
};
