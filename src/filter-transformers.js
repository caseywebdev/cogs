const _ = require('underscore');
const minimatch = require('minimatch');
const toArray = require('./to-array');

const doesMatch = (path, transformer) => {
  const only = toArray(transformer.only);
  const except = toArray(transformer.except);
  const match = _.partial(minimatch, path);
  return (!only.length || _.any(only, match)) &&
    (!except.length || !_.any(except, match));
};

module.exports = ({path, transformers}) =>
  _.filter(transformers, _.partial(doesMatch, path));
