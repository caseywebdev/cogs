var _ = require('underscore');
var async = require('async');
var getHash = require('./get-hash');
var pruneDependencies = require('./prune-dependencies');
var resolveDependencies = require('./resolve-dependencies');

var pick = _.partial(_.pick, _, 'path', 'hash');

module.exports = function (filePath, cb) {
  async.waterfall([
    _.partial(resolveDependencies, filePath),
    function (dependencies, cb) {
      var requires = dependencies.requires;
      var links = dependencies.links;
      var buffer = Buffer.concat(_.map(requires, 'buffer'));
      cb(null, pruneDependencies({
        path: filePath,
        buffer: buffer,
        hash: getHash(buffer),
        requires: _.map(requires, pick),
        links: _.map(links, pick),
        globs: dependencies.globs
      }));
    }
  ], cb);
};
