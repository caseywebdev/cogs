var _ = require('underscore');
var config = require('./config');
var getExt = require('./get-ext');
var getTransformer = require('./get-transformer');
var minimatch = require('minimatch');
var toArray = require('./to-array');

var filterOnlyExcept = function (filePath, transformer) {
  var only = toArray(transformer.only);
  var except = toArray(transformer.except);
  var match = _.partial(minimatch, filePath);
  return (!only.length || _.any(only, match)) &&
    (!except.length || !_.any(except, match));
};

module.exports = function (filePath, ext) {
  if (ext == null) ext = getExt(filePath);
  var info = config.get().in[ext] || {};
  var transformers = toArray(info.transformers);
  var extChange = info.out && ext !== info.out;
  var filter = _.partial(filterOnlyExcept, filePath);
  return _.filter(_.map(transformers, getTransformer), filter)
    .concat(extChange ? module.exports(filePath, info.out) : []);
};
