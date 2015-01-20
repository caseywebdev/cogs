var _ = require('underscore');
var async = require('async');
var getGlobHash = require('./get-glob-hash');
var getFileHash = require('./get-file-hash');

var objZip = function (keys, cb, er, hashes, keys) {
  cb(er, _.object(keys, hashes));
};

module.exports = function (file, cb) {
  var includes = file.includes;
  var links = file.links;
  var globs = file.globs;
  async.parallel({
    includes: function (cb) {
      async.map(includes, getFileHash, _.partial(objZip, includes, cb));
    },
    links: function (cb) {
      async.map(links, getFileHash, _.partial(objZip, links, cb));
    },
    globs: function (cb) {
      async.map(globs, getGlobHash, _.partial(objZip, globs, cb));
    }
  }, cb);
};
