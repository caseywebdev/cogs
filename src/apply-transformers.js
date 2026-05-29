import filterTransformers from '#src/filter-transformers.js';
import pruneDependencies from '#src/prune-dependencies.js';

export default async ({ file, transformers }) => {
  const applicable = filterTransformers({ transformers, path: file.path });
  for (const { fn, options = {} } of applicable) {
    const changes = await fn({ file, options });
    file = pruneDependencies(Object.assign({}, file, changes));
  }
  return file;
};
