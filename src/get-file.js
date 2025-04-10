import { promises as fs } from 'fs';

import _ from 'underscore';

import applyTransformers from './apply-transformers.js';

export default async ({ env: { cache, transformers }, path }) =>
  (cache[path] ??= (async () => {
    const file = {
      buffer: await fs.readFile(path),
      builds: [],
      links: [],
      path,
      requires: [path]
    };

    const transformed = await applyTransformers({ file, transformers });

    if (_.isEqual(file, transformed)) delete cache[path];

    return transformed;
  })()).catch(er => {
    delete cache[path];
    throw er;
  });
