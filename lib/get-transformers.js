var _ = require('underscore');

var getTransformer = function (transformer) {
  if (_.isString(transformer)) transformer = {name: transformer};
  return _.extend({options: {}}, transformer);
};

var getTransformers = module.exports = function (ext, config) {
  var info = config.in && config.in[ext] || {};
  var transformers = info.transformers || [];
  if (!_.isArray(transformers)) transformers = [transformers];
  return _.map(transformers, getTransformer).concat(
    info.out && ext !== info.out ? getTransformers(info.out, config) : []
  );
};
