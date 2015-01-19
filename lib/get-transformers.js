var _ = require('underscore');

var getTransformer = function (transformer) {
  if (_.isString(transformer)) transformer = {name: transformer};
  return {
    transformer: require('./transformers/' + transformer.name),
    options: transformer.options || {}
  };
};

var getTransformers = module.exports = function (ext, options) {
  var info = options.in[ext] || {};
  var transformers = info.transformers || [];
  if (!_.isArray(transformers)) transformers = [transformers];
  return _.map(transformers, getTransformer).concat(
    info.out && ext !== info.out ? getTransformers(info.out, options) : []
  );
};
