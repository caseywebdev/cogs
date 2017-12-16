const _ = require('underscore');
const minimatch = require('minimatch');
const toArray = require('./to-array');

const doesMatch = ({handler, path}) => {
  const only = toArray(handler.only);
  const except = toArray(handler.except);
  const match = _.partial(minimatch, path);
  return (!only.length || _.any(only, match)) &&
    (!except.length || !_.any(except, match));
};

module.exports = ({handlers, path}) =>
  _.filter(handlers, handler => doesMatch({handler, path}));
