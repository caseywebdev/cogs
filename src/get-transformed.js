var _ = require('underscore');
var async = require('async');
var getTransformers = require('./get-transformers');
var pruneDependencies = require('./prune-dependencies');

var updateFile = function (file, updatedFile, cb) {
  cb(null, pruneDependencies(_.extend({}, file, updatedFile)));
};

var iterator = function (file, transformer, cb) {
  async.waterfall([
    _.partial(transformer.fn, file, transformer.options),
    _.partial(updateFile, file)
  ], cb);
};

module.exports = function (file, cb) {
  async.reduce(getTransformers(file.path), file, iterator, cb);
};
