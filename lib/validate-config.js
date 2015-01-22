var _ = require('underscore');
var readFile = require('./read-file');
var VERSION = require('../package').version;

var loadManifest = function (config, cb) {
  if (config.manifest || !config.manifestPath) return cb();
  readFile(config.manifestPath, function (er, source) {
    try { config.manifest = JSON.parse(source); } catch (er) {}
    cb();
  });
};

module.exports = function (config, cb) {
  loadManifest(config, function () {
    if (!config.in) config.in = {};
    if (!config.manifest ||
        config.manifest.__VERSION__ !== VERSION ||
        !_.isEqual(config.manifest.__IN__, config.in)) {
      config.manifest = {
        __VERSION__: VERSION,
        __IN__: JSON.parse(JSON.stringify(config.in))
      };
    }
    cb();
  });
};
