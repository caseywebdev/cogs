var _ = require('underscore');
var getExt = require('./get-ext');

var getTransformer = function (transformer) {
  if (_.isString(transformer)) transformer = {name: transformer};
  return _.extend({options: {}}, transformer);
};

var filterOnlyExcept = function (filePath, transformer) {
  return (!transformer.only || _.contains(transformer.only, filePath)) &&
    (!transformer.except || !_.contains(transformer.except, filePath));
};

module.exports = function (filePath, config, ext) {
  if (ext == null) ext = getExt(filePath);
  var info = config.in && config.in[ext] || {};
  var transformers = info.transformers || [];
  if (!_.isArray(transformers)) transformers = [transformers];
  var extChange = info.out && ext !== info.out;
  return _.chain(transformers)
    .map(getTransformer)
    .filter(_.partial(filterOnlyExcept, filePath))
    .value()
    .concat(extChange ? module.exports(filePath, config, info.out) : []);
};
