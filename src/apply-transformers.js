const _ = require('underscore');
const filterHandlers = require('./filter-handlers');
const pruneDependencies = require('./prune-dependencies');

module.exports = async ({file, transformers}) => {
  const applicable = filterHandlers({handlers: transformers, path: file.path});
  for (let {fn, options = {}} of applicable) {
    const changes = await fn({file, options});
    file = pruneDependencies(_.extend({}, file, changes));
  }
  return file;
};
