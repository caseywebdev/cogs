var _ = require('underscore');
var async = require('async');
var getHash = require('./get-hash');
var getTransformed = require('./get-transformed');
var memoize = require('./memoize');
var readFile = require('./read-file');

module.exports = memoize(function (filePath, cb) {
  async.waterfall([
    _.partial(readFile, filePath),
    function (buffer, cb) {
      var hash = getHash(buffer);
      getTransformed({
        path: filePath,
        buffer: buffer,
        hash: hash,
        requires: [filePath],
        links: [],
        globs: []
      }, cb);
    }
  ], cb);
});
