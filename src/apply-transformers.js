const _ = require('underscore');
const filterTransformers = require('./filter-transformers');
const pruneDependencies = require('./prune-dependencies');

module.exports = async ({file, transformers}) => {
  const applicable = filterTransformers({transformers, path: file.path});
  for (let {fn, options = {}} of applicable) {
    const changes = await fn({file, options});
    file = pruneDependencies(_.extend({}, file, changes));
  }
  return file;
};
