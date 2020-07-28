import { promises as fs } from 'fs';

import applyTransformers from './apply-transformers.js';
import getOrSet from './get-or-set.js';

const readFile = ({ cache, path }) =>
  getOrSet(cache.buffers, path, () => fs.readFile(path));

export default ({ env: { cache, transformers }, path }) =>
  getOrSet(cache.files, path, async () => {
    try {
      return await applyTransformers({
        file: {
          buffer: await readFile({ cache, path }),
          builds: [],
          links: [],
          path,
          requires: [path]
        },
        transformers
      });
    } catch (er) {
      er.message += `\n  ${path}`;
      throw er;
    }
  });
