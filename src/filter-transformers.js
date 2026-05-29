import npath from 'node:path';

import toArray from './to-array.js';

const doesMatch = ({ transformer, path }) => {
  const only = toArray(transformer.only);
  const except = toArray(transformer.except);
  return (
    (!only.length || only.some(pattern => npath.matchesGlob(path, pattern))) &&
    (!except.length ||
      !except.some(pattern => npath.matchesGlob(path, pattern)))
  );
};

export default ({ transformers, path }) =>
  transformers.filter(transformer => doesMatch({ transformer, path }));
