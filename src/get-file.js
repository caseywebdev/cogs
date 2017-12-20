const applyTransformers = require('./apply-transformers');
const getBuffer = require('./get-buffer');
const getOrSet = require('./get-or-set');

const readFile = ({cache, path}) =>
  getOrSet(cache.buffers, path, () => getBuffer(path));

module.exports = ({env: {cache, transformers}, path}) =>
  getOrSet(cache.files, path, async () => {
    try {
      return await applyTransformers({
        file: {
          buffer: await readFile({cache, path}),
          builds: [],
          globs: [],
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
