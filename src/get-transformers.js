var _ = require('underscore');
var config = require('./config');
var getExt = require('./get-ext');
var minimatch = require('minimatch');

var getTransformer = function (transformer) {
  if (_.isString(transformer)) transformer = {name: transformer};
  return _.extend({options: {}}, transformer);
};

var normalize = function (val) { return _.isString(val) ? [val] : val; };

var filterOnlyExcept = function (filePath, transformer) {
  var only = normalize(transformer.only);
  var except = normalize(transformer.except);
  var match = _.partial(minimatch, filePath);
  return (!only || _.any(only, match)) && (!except || !_.any(except, match));
};

module.exports = function (filePath, ext) {
  if (ext == null) ext = getExt(filePath);
  var info = config.get().in[ext] || {};
  var transformers = info.transformers || [];
  if (!_.isArray(transformers)) transformers = [transformers];
  var extChange = info.out && ext !== info.out;
  return _.chain(transformers)
    .map(getTransformer)
    .filter(_.partial(filterOnlyExcept, filePath))
    .value()
    .concat(extChange ? module.exports(filePath, info.out) : []);
};
