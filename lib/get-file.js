var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getCached = require('./get-cached');
var getHash = require('./get-hash');
var getTransformed = require('./get-transformed');

module.exports = function (filePath, config, cb) {
  async.waterfall([
    _.partial(getCached, filePath, config.files),
    function (file, _cb) {
      if (_cb) return cb(null, file);
      fs.readFile(filePath, _cb || file);
    },
    function (buffer, cb) {
      getTransformed({
        path: filePath,
        buffer: buffer,
        includes: [[filePath, getHash(buffer)]],
        links: [],
        globs: []
      }, config, cb);
    },
    function (file, cb) {
      cb(null, config.files[file.path] = file);
    }
  ], cb);
};

// config = {files: {}, in:{js:{transformers:['extract-directives', '6to5', {name: 'prepend-path', options: {before: '/* ', after: ' */'}}]}}}; require('./lib/get-file')('lib/get-file.js', config, function (er, file) { console.log(er || file.buffer.toString())})
