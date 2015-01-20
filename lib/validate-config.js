var _ = require('underscore');
var VERSION = require('../package').version;

module.exports = function (config) {
  if (!config.manifest ||
      config.manifest.__VERSION__ !== VERSION ||
      !_.isEqual(config.manifest.__IN__, config.in)) {
    config.manifest = {
      __VERSION__: VERSION,
      __IN__: config.in
    };
  }
  if (!config.in) config.in = {};
  if (!config.files) config.files = {};
};
