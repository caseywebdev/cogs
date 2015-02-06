var _ = require('underscore');
var async = require('async');
var getHash = require('./get-hash');
var getGlobHash = require('./get-glob-hash');
var resolveDependencies = require('./resolve-dependencies');

var pick = _.partial(_.pick, _, 'path', 'hash');

module.exports = function (filePath, cb) {
  async.waterfall([
    _.partial(resolveDependencies, filePath),
    function (dependencies, cb) {
      var requires = dependencies.requires;
      var links = dependencies.links;
      var buffer = Buffer.concat(_.map(requires, 'buffer'));
      async.waterfall([
        function (cb) {
          async.map(dependencies.globs, function (pattern, cb) {
            async.waterfall([
              _.partial(getGlobHash, pattern),
              function (hash) { cb(null, {path: pattern, hash: hash}); }
            ], cb);
          }, cb);
        },
        function (globs, cb) {
          cb(null, {
            path: filePath,
            buffer: buffer,
            hash: getHash(buffer),
            requires: _.map(requires, pick),
            links: _.map(links, pick),
            globs: globs
          });
        }
      ], cb);
    }
  ], cb);
};
