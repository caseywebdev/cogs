const _ = require('underscore');
const applyTransformers = require('./apply-transformers');
const getBuffer = require('./get-buffer');
const getOrSet = require('./get-or-set');

const readFile = ({cache, path}) =>
  getOrSet(cache.buffers, path, () => getBuffer(path));

module.exports = ({env: {cache, transformers}, path}) =>
  getOrSet(cache.files, path, () =>
    readFile({cache, path}).then(buffer =>
      applyTransformers({
        file: {
          buffer,
          globs: [],
          links: [],
          path,
          requires: [path],
          startedAt: _.now()
        },
        transformers
      })
    ).then(file => {
      file.endedAt = _.now();
      return file;
    })
  );
