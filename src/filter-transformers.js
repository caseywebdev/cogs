import minimatch from 'minimatch';
import _ from 'underscore';

import toArray from './to-array.js';

const doesMatch = ({ transformer, path }) => {
  const only = toArray(transformer.only);
  const except = toArray(transformer.except);
  const match = _.partial(minimatch, path);
  return (
    (!only.length || _.any(only, match)) &&
    (!except.length || !_.any(except, match))
  );
};

export default ({ transformers, path }) =>
  _.filter(transformers, transformer => doesMatch({ transformer, path }));
