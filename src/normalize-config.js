const _ = require('underscore');
const normalizeTransformer = require('./normalize-transformer');
const toArray = require('./to-array');

const normalizeConfig = module.exports = (config, buffers = {}) => {
  let {envs} = config || {};
  if (!envs) {
    envs = config;
    config = {};
  }

  envs = toArray(envs);

  const {manifestPath, then} = config;
  return _.extend({}, config, {
    envs: _.map(envs, ({builds, manifestPath, then, transformers}) => ({
      builds,
      cache: {buffers, files: {}},
      manifestPath,
      transformers: _.map(toArray(transformers), normalizeTransformer),
      then: then && normalizeConfig(then, buffers)
    })),
    manifestPath,
    then: then && normalizeConfig(then, buffers)
  });
};
