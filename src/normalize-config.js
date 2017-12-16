const _ = require('underscore');
const normalizeHandler = require('./normalize-handler');
const toArray = require('./to-array');

const normalizeHandlers = (type, handlers) =>
  _.map(toArray(handlers), handler => normalizeHandler(type, handler));

module.exports = config => {
  let {envs, exporters} = config;
  if (!envs) {
    envs = toArray(config);
    config = {};
  }

  const buffers = {};
  return _.extend({}, config, {
    envs: _.map(toArray(envs), ({builds, exporters, transformers}) => ({
      builds,
      cache: {buffers, files: {}},
      exporters: normalizeHandlers('exporter', exporters),
      transformers: normalizeHandlers('transformer', transformers)
    })),
    exporters: normalizeHandler('exporter', exporters)
  });
};
