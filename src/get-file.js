import { promises as fs } from 'fs';

import applyTransformers from './apply-transformers.js';
import getOrSet from './get-or-set.js';

export default ({ env: { cache, transformers }, path }) =>
  getOrSet(cache, path, async () => {
    try {
      return await applyTransformers({
        file: {
          buffer: await fs.readFile(path),
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
