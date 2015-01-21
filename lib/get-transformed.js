var _ = require('underscore');
var async = require('async');
var getExt = require('./get-ext');
var getTransformers = require('./get-transformers');
var pruneDependencies = require('./prune-dependencies');

var updateFile = function (file, updatedFile, cb) {
  cb(null, pruneDependencies(_.extend({}, file, updatedFile)));
};

var getTransformerFn =  function (transformer) {
  return function (file, cb) {
    var fn = require('./transformers/' + transformer.name);
    async.waterfall([
      _.partial(fn, file, transformer.options),
      _.partial(updateFile, file)
    ], cb);
  };
};

var initTransformerFn = function (file, cb) { cb(null, file); };

module.exports = function (file, config, cb) {
  var transformers = getTransformers(getExt(file.path), config);
  async.waterfall([_.partial(initTransformerFn, file)].concat(
    _.map(transformers, getTransformerFn)
  ), cb);
};