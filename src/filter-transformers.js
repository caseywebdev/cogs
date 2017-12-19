const _ = require('underscore');
const minimatch = require('minimatch');
const toArray = require('./to-array');

const doesMatch = ({transformer, path}) => {
  const only = toArray(transformer.only);
  const except = toArray(transformer.except);
  const match = _.partial(minimatch, path);
  return (!only.length || _.any(only, match)) &&
    (!except.length || !_.any(except, match));
};

module.exports = ({transformers, path}) =>
  _.filter(transformers, transformer => doesMatch({transformer, path}));
