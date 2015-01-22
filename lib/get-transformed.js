var _ = require('underscore');
var async = require('async');
var getTransformers = require('./get-transformers');
var pruneDependencies = require('./prune-dependencies');

var updateFile = function (file, updatedFile, cb) {
  cb(null, pruneDependencies(_.extend({}, file, updatedFile)));
};

var getTransformerFn =  function (transformer) {
  return function (file, cb) {
    var fn;
    try {
      fn = require('./transformers/' + transformer.name);
    } catch (er) {
      return cb(new Error('Invalid transformer: "' + transformer.name + '"'));
    }
    async.waterfall([
      _.partial(fn, file, transformer.options),
      _.partial(updateFile, file)
    ], cb);
  };
};

var initTransformerFn = function (file, cb) { cb(null, file); };

module.exports = function (file, config, cb) {
  var transformers = getTransformers(file.path, config);
  async.waterfall([_.partial(initTransformerFn, file)].concat(
    _.map(transformers, getTransformerFn)
  ), cb);
};
