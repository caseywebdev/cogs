const _ = require('underscore');
const getFile = require('./get-file');
const Promise = require('better-promise').default;

const walk = ({env, path, visited = {}}) => {
  if (visited[path]) return visited[path].then(file => [file]);

  return (visited[path] = getFile({env, path}))
    .then(({requires}) =>
      Promise.all(_.map(requires, path => walk({env, path, visited})))
    )
    .then(files => _.unique(_.flatten(files)))
    .catch(er => {
      const line = `\n  ${path}`;
      if (er.message.indexOf(line) === -1) er.message += line;
      throw er;
    });
};

module.exports = walk;
