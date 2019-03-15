const _ = require('underscore');

const normalizeTransformer = require('./normalize-transformer');
const toArray = require('./to-array');

module.exports = config => {
  const buffers = {};

  config = _.mapObject(
    config,
    ({ builds, transformers, manifestPath, requires }, name) => ({
      builds: _.mapObject(builds, ({ transformers, ...build }) => ({
        ...build,
        transformers: _.map(toArray(transformers), normalizeTransformer)
      })),
      cache: { buffers, files: {} },
      manifestPath,
      name,
      requires: toArray(requires),
      transformers: _.map(toArray(transformers), normalizeTransformer)
    })
  );

  _.each(
    config,
    env => (env.requires = _.map(env.requires, name => config[name]))
  );

  return config;
};
