var _ = require('underscore');
var async = require('async');
var getTransformers = require('./get-transformers');
var path = require('path');
var pruneDependencies = require('./prune-dependencies');

var updateFile = function (file, updatedFile, cb) {
  cb(null, pruneDependencies(_.extend({}, file, updatedFile)));
};

var iterator = function (file, transformer, cb) {
  var name = transformer.name;
  var resolved;
  try { resolved = require.resolve(path.resolve(name)); } catch (er) {
  try { resolved = require.resolve('./transformers/' + name); } catch (er) {
  try { resolved = require.resolve('cogs-transformer-' + name); } catch (er) {
    return cb(new Error("Cannot find transformer '" + name + "'"));
  }}}
  async.waterfall([
    _.partial(require(resolved), file, transformer.options),
    _.partial(updateFile, file)
  ], cb);
};

module.exports = function (file, cb) {
  async.reduce(getTransformers(file.path), file, iterator, cb);
};
