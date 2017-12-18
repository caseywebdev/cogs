const _ = require('underscore');
const normalizeHandler = require('./normalize-handler');
const toArray = require('./to-array');

const normalizeHandlers = (type, handlers) =>
  _.map(toArray(handlers), handler => normalizeHandler(type, handler));

module.exports = config => {
  let {envs} = config;
  if (!envs) {
    envs = config;
    config = {};
  }

  envs = toArray(envs);

  const {exporters} = config;
  const buffers = {};
  return _.extend({}, config, {
    envs: _.map(envs, ({builds, exporters, transformers}) => ({
      builds,
      cache: {buffers, files: {}},
      exporters: normalizeHandlers('exporter', exporters),
      transformers: normalizeHandlers('transformer', transformers)
    })),
    exporters: normalizeHandlers('exporter', exporters)
  });
};
