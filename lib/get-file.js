var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getCached = require('./get-cached');
var getHash = require('./get-hash');
var getTransformed = require('./get-transformed');
var cbQueue = require('./cb-queue');

module.exports = function (filePath, config, cb) {
  var cbQueueKey = [module.exports, filePath];
  if (cbQueue.push(config, cbQueueKey, cb)) return;
  async.waterfall([
    _.partial(getCached, filePath, config.files),
    function (file, cb) {
      if (file) return cb(null, file);
      async.waterfall([
        _.partial(fs.readFile, filePath),
        function (buffer, cb) {
          getTransformed({
            path: filePath,
            buffer: buffer,
            hash: getHash(buffer),
            includes: [[filePath, getHash(buffer)]],
            links: [],
            globs: []
          }, config, cb);
        },
        function (file, cb) { cb(null, config.files[file.path] = file); }
      ], cb);
    }
  ], _.partial(cbQueue.call, config, cbQueueKey));
};
