const _ = require('underscore');
const config = require('./config');
const minimatch = require('minimatch');
const toArray = require('./to-array');

const doesMatch = (filePath, transformer) => {
  const only = toArray(transformer.only);
  const except = toArray(transformer.except);
  const match = _.partial(minimatch, filePath);
  return (!only.length || _.any(only, match)) &&
    (!except.length || !_.any(except, match));
};

module.exports = filePath =>
  _.filter(config.get().pipe, _.partial(doesMatch, filePath));
