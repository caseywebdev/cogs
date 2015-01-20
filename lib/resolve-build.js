var _ = require('underscore');
var async = require('async');
var getHash = require('./get-hash');
var pruneDependencies = require('./prune-dependencies');
var resolveDependencies = require('./resolve-dependencies');

var zipFile = function (file) {
  return [file.path, file.hash];
};

module.exports = function (filePath, config, cb) {
  async.waterfall([
    function (cb) {
      async.parallel({
        includes: _.partial(resolveDependencies, filePath, config, 'includes'),
        links: _.partial(resolveDependencies, filePath, config, 'links')
      }, cb);
    },
    function (dependencies, cb) {
      var includes = dependencies.includes;
      var links = dependencies.links;
      var buffer = Buffer.concat(_.map(includes, 'buffer'));
      cb(null, pruneDependencies({
        path: filePath,
        buffer: buffer,
        hash: getHash(buffer),
        includes: _.map(includes, zipFile),
        links: _.map(links, zipFile),
        globs: _.flatten(_.map(includes.concat(links), 'globs'), true)
      }));
    }
  ], cb);
};
