import npath from 'node:path';

import _ from 'underscore';

import toArray from './to-array.js';

const doesMatch = ({ transformer, path }) => {
  const only = toArray(transformer.only);
  const except = toArray(transformer.except);
  return (
    (!only.length ||
      _.any(only, pattern => npath.matchesGlob(path, pattern))) &&
    (!except.length ||
      !_.any(except, pattern => npath.matchesGlob(path, pattern)))
  );
};

export default ({ transformers, path }) =>
  _.filter(transformers, transformer => doesMatch({ transformer, path }));
