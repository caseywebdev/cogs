const _ = require('underscore');
const getFile = require('./get-file');
const Promise = require('better-promise').default;

const getFiles = ({env, files = {}, path}) => {
  if (files[path]) return files;

  files[path] = true;
  return getFile({env, path}).then(file => {
    files[path] = file;
    return Promise.all(_.map(file.requires, path =>
      getFiles({env, files, path})
    ));
  }).then(() => files).catch(er => {
    const line = `\n  ${path}`;
    if (er.message.indexOf(line) === -1) er.message += line;
    throw er;
  });
};

const walk = ({files, path, visited = {}}) => {
  const file = files[path];
  if (visited[path]) return file;

  visited[path] = true;
  const graph = _.map(file.requires, path => walk({files, path, visited}));
  return _.unique(_.flatten(graph));
};

module.exports = ({env, path}) =>
  getFiles({env, path}).then(files => walk({files, path}));
