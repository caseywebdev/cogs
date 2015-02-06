var _ = require('underscore');
var fs = require('fs');
var getFile = require('./get-file');
var getTransformer = require('./get-transformer');
var toArray = require('./to-array');

var VERSION = require('../package').version;

var validate = function (config) {
  config = _.clone(config) || {};
  if (!config.in) config.in = {};
  if (!config.manifest && config.manifestPath) {
    try {
      var source = fs.readFileSync(config.manifestPath, 'utf8');
      config.manifest = JSON.parse(source);
    } catch (er) {}
  }

  var transformers = _.reduce(config.in, function (transformers, info) {
    _.each(toArray(info.transformers), function (transformer) {
      transformer = getTransformer(transformer);
      transformers[transformer.name] = transformer.version;
    });
    return transformers;
  }, {});

  if (!config.manifest ||
      config.manifest.__VERSION__ !== VERSION ||
      !_.isEqual(config.manifest.__IN__, config.in) ||
      !_.isEqual(config.manifest.__TRANSFORMERS__, transformers)) {
    config.manifest = {
      __VERSION__: VERSION,
      __IN__: JSON.parse(JSON.stringify(config.in)),
      __TRANSFORMERS__: transformers
    };
    getFile.cache = {};
  }

  return config;
};

var config = validate();

exports.get = function () {
  return config;
};

exports.set = function (newConfig) {
  config = validate(newConfig);
};
