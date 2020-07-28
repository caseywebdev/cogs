import _ from 'underscore';

import filterTransformers from './filter-transformers.js';
import pruneDependencies from './prune-dependencies.js';

export default async ({ file, transformers }) => {
  const applicable = filterTransformers({ transformers, path: file.path });
  for (const { fn, options = {} } of applicable) {
    const changes = await fn({ file, options });
    file = pruneDependencies(_.extend({}, file, changes));
  }
  return file;
};
