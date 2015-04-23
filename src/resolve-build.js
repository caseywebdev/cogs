var _ = require('underscore');
var async = require('async');
var getFileHash = require('./get-file-hash');
var getHash = require('./get-hash');
var getGlobHash = require('./get-glob-hash');
var resolveDependencies = require('./resolve-dependencies');

var getAsyncHashFn = function (paths, hashGetter) {
  return _.partial(async.map, paths, function (path, cb) {
    async.waterfall([
      _.partial(hashGetter, path),
      function (hash) { cb(null, {path: path, hash: hash}); }
    ], cb);
  });
};

module.exports = function (filePath, cb) {
  async.waterfall([
    _.partial(resolveDependencies, filePath),
    function (dependencies, cb) {
      async.waterfall([
        function (cb) {
          async.parallel({
            links: getAsyncHashFn(dependencies.links, getFileHash),
            globs: getAsyncHashFn(dependencies.globs, getGlobHash)
          }, cb);
        },
        function (linksAndGlobs, cb) {
          var requires = dependencies.requires;
          var buffer = Buffer.concat(_.map(requires, 'buffer'));
          cb(null, {
            path: filePath,
            buffer: buffer,
            hash: getHash(buffer),
            requires: _.map(requires, _.partial(_.pick, _, 'path', 'hash')),
            links: linksAndGlobs.links,
            globs: linksAndGlobs.globs
          });
        }
      ], cb);
    }
  ], cb);
};
