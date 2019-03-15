const _ = require('underscore');

const normalizeTransformer = require('./normalize-transformer');
const toArray = require('./to-array');

module.exports = config => {
  const buffers = {};

  config = toArray(config);

  config = _.map(
    config,
    ({ builds, transformers, manifestPath, requires }) => ({
      builds,
      cache: { buffers, files: {} },
      manifestPath,
      requires: toArray(requires),
      transformers: _.map(toArray(transformers), normalizeTransformer)
    })
  );

  _.each(config, env => (env.requires = _.map(env.requires, i => config[i])));

  return config;
};
