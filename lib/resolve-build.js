var _ = require('underscore');
var async = require('async');
var getHash = require('./get-hash');
var pruneDependencies = require('./prune-dependencies');
var resolveDependencies = require('./resolve-dependencies');

var zipFile = function (file) {
  return [file.path, file.hash];
};

module.exports = function (filePath, cb) {
  async.waterfall([
    function (cb) {
      async.parallel({
        includes: _.partial(resolveDependencies, filePath, 'includes'),
        links: _.partial(resolveDependencies, filePath, 'links')
      }, cb);
    },
    function (dependencies, cb) {
      var includes = dependencies.includes;
      var links = dependencies.links;
      var source = _.map(includes, 'source').join('');
      cb(null, pruneDependencies({
        path: filePath,
        source: source,
        hash: getHash(source),
        includes: _.map(includes, zipFile),
        links: _.map(links, zipFile),
        globs: _.flatten(_.map(includes.concat(links), 'globs'), true)
      }));
    }
  ], cb);
};
