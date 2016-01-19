'use strict';

const _ = require('underscore');
const fs = require('fs');
const getFile = require('./get-file');
const getTransformer = require('./get-transformer');
const toArray = require('./to-array');

const __VERSION__ = require('../package').version;

const validate = function (config) {
  config = _.clone(config) || {};
  config.pipe = _.map(toArray(config.pipe), getTransformer);
  const __PIPE__ = JSON.parse(JSON.stringify(config.pipe));

  if (!config.manifest && config.manifestPath) {
    try {
      const source = fs.readFileSync(config.manifestPath, 'utf8');
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

let config = validate();

exports.get = () => config;

exports.set = newConfig => config = validate(newConfig);
