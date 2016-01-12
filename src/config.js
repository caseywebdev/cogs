var _ = require('underscore');
var fs = require('fs');
var getFile = require('./get-file');
var getTransformer = require('./get-transformer');

var __VERSION__ = require('../package').version;

var validate = function (config) {
  config = _.clone(config) || {};
  if (!config.pipe) config.pipe = [];
  config.pipe = _.map(config.pipe, getTransformer);
  var __PIPE__ = JSON.parse(JSON.stringify(config.pipe));

  if (!config.manifest && config.manifestPath) {
    try {
      var source = fs.readFileSync(config.manifestPath, 'utf8');
      config.manifest = JSON.parse(source);
    } catch (er) {}
  }

  if (!config.manifest ||
      config.manifest.__VERSION__ !== __VERSION__ ||
      !_.isEqual(config.manifest.__PIPE__, __PIPE__)) {
    config.manifest = {__VERSION__, __PIPE__};
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
