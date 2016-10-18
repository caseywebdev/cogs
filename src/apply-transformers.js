const _ = require('underscore');
const filterTransformers = require('./filter-transformers');
const Promise = require('better-promise').default;
const pruneDependencies = require('./prune-dependencies');

module.exports = ({file, transformers}) =>
  _.reduce(
    filterTransformers({path: file.path, transformers}),
    (promise, {fn, options = {}}) =>
      promise.then(file =>
        Promise.resolve()
          .then(() => fn({file, options}))
          .then(changes => pruneDependencies(_.extend({}, file, changes)))
      ),
    Promise.resolve(file)
  );
