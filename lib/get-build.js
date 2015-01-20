var fs = require('fs');
var getFile = require('./get-file');
var path = require('path');

var CACHE;

module.exports = function (filePath, config, cb) {
  filePath = path.resolve(filePath);
  fs.readFile(filePath, function (er, data) {
    if (er) return cb(er);
    cb(null, {data: data, hash: getHash(data)});
  });
};

// Use cached if
//  - files[source] exists
//  - __COGS_VERSION__ matches
//  - __CONFIG__ _.isEqual
//  - target matches
//  - target file exists and matches hash
//  - every dependency hash matches
//  - every glob entry matches

var VERSION = require('../package').version;

var validateManifest = function (config) {
  var manifest = config.manifest || {};
  if (config.manifest &&
      manifest.__VERSION__ !== VERSION &&
      !_.isEqual(manifest.__IN__, config.in)) {
    return config;
  }
  return update(config, {manifest: {$set: {
    __VERSION__: VERSION,
    __IN__: config.in
  }}});
};

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var getDependencyHashes = require('./get-dependency-hashes');
var getHash = require('./get-hash');
var path = require('path');
var update = require('react/addons').update;

var updateFiles = function (file, config, cb) {
  var delta = {files: {}};
  delta.files[file.path] = {$extend: _.pick(file, 'buffer')};
  config = update(config, delta);
  getDependencyHashes(file.dependencies, function (er, hashes) {
    if (er) return cb(er);
    delta.files[file.path] = {$extend: hashes};
    return cb(null, file, update(config, delta));
  });
};
