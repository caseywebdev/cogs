const _ = require('underscore');
const normalizeTransformer = require('./normalize-transformer');
const toArray = require('./to-array');

const normalizeTransformers = transformers =>
  _.map(toArray(transformers), normalizeTransformer);

module.exports = config => {
  let {envs} = config;
  if (!envs) {
    envs = toArray(config);
    config = {};
  }

  const buffers = {};
  return _.extend({}, config, {
    envs: _.map(toArray(envs), ({builds, transformers}) => ({
      builds,
      cache: {buffers, files: {}},
      transformers: normalizeTransformers(transformers)
    }))
  });
};
