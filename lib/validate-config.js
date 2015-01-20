var _ = require('underscore');
var fs = require('fs');
var VERSION = require('../package').version;

var loadManifest = function (config, cb) {
  if (config.manifest || !config.manifestPath) return cb();
  fs.readFile(config.manifestPath, function (er, data) {
    try { config.manifest = JSON.parse(data); } catch (er) {}
    if (!config.manifest ||
        config.manifest.__VERSION__ !== VERSION ||
        !_.isEqual(config.manifest.__IN__, config.in)) {
      config.manifest = {
        __VERSION__: VERSION,
        __IN__: config.in
      };
    }
    cb();
  });
};

module.exports = function (config, cb) {
  loadManifest(config, function () {
    if (!config.in) config.in = {};
    if (!config.files) config.files = {};
    cb();
  });
};
