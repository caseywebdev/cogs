var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getCached = require('./get-cached');
var getHash = require('./get-hash');
var getTransformed = require('./get-transformed');

module.exports = function (filePath, config, cb) {
  async.waterfall([
    _.partial(getCached, filePath, config.files),
    function (file, cb) {
      if (file) return cb(null, file);
      async.waterfall([
        _.partial(fs.readFile, filePath, 'utf8'),
        function (source, cb) {
          var hash = getHash(source);
          getTransformed({
            path: filePath,
            source: source,
            hash: hash,
            includes: [[filePath, hash]],
            links: [],
            globs: []
          }, config, cb);
        },
        function (file, cb) { cb(null, config.files[file.path] = file); }
      ], cb);
    }
  ], cb);
};
