var _ = require('underscore');
var fs = require('fs');
var getFile = require('./get-file');
var memoize = require('./memoize');
var VERSION = require('../package').version;

var config = {};

var validate = function () {
  if (!config.in) config.in = {};
  if (!config.manifest && config.manifestPath) {
    try {
      var source = fs.readFileSync(config.manifestPath, 'utf8');
      config.manifest = JSON.parse(source);
    } catch (er) {}
  }
  if (!config.manifest ||
      config.manifest.__VERSION__ !== VERSION ||
      !_.isEqual(config.manifest.__IN__, config.in)) {
    config.manifest = {
      __VERSION__: VERSION,
      __IN__: JSON.parse(JSON.stringify(config.in))
    };
  }
};

validate();

exports.get = function () {
  return config;
};

exports.set = function (newConfig) {
  var oldIn = config.in;
  config = newConfig;
  validate();
  if (!_.isEqual(oldIn, config.in)) memoize.bust('**/*', [getFile]);
};
