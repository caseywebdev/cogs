var _ = require('underscore');

var getTransformer = function (transformer) {
  if (_.isString(transformer)) transformer = {name: transformer};
  return _.extend({options: {}}, transformer);
};

var getTransformers = module.exports = function (ext, options) {
  var info = options.in && options.in[ext] || {};
  var transformers = info.transformers || [];
  if (!_.isArray(transformers)) transformers = [transformers];
  return _.map(transformers, getTransformer).concat(
    info.out && ext !== info.out ? getTransformers(info.out, options) : []
  );
};
