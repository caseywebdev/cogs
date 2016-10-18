const _ = require('underscore');
const getFile = require('./get-file');
const pruneDependencies = require('./prune-dependencies');
const Promise = require('better-promise').default;

const walk = ({env, path, visited = {}}) => {
  if (visited[path]) return visited[path].then(file => [file]);

  return (visited[path] = getFile({env, path}))
    .then(file =>
      Promise.all(_.map(file.requires, path => walk({env, path, visited})))
    )
    .then(files => _.unique(_.flatten(files)))
    .catch(er => {
      const line = `\n  ${path}`;
      if (er.message.indexOf(line) === -1) er.message += line;
      throw er;
    });
};

module.exports = ({env, path}) =>
  walk({env, path}).then(files =>
    _.extend(pruneDependencies({
      requires: _.map(files, 'path'),
      links: _.flatten(_.map(files, 'links')),
      globs: _.flatten(_.map(files, 'globs'))
    }), {requires: files})
  );
