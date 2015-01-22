var _ = require('underscore');
var async = require('async');
var getHash = require('./get-hash');
var getTransformed = require('./get-transformed');
var memoize = require('./memoize');
var readFile = require('./read-file');

module.exports = memoize(function (filePath, cb) {
  async.waterfall([
    _.partial(readFile, filePath),
    function (source, cb) {
      var hash = getHash(source);
      getTransformed({
        path: filePath,
        source: source,
        hash: hash,
        includes: [[filePath, hash]],
        links: [],
        globs: []
      }, cb);
    }
  ], cb);
}, true);
