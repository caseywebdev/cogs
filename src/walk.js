const _ = require('underscore');
const getFile = require('./get-file');

const getFiles = async ({env, files = {}, path}) => {
  if (files[path]) return files;

  files[path] = true;
  const file = await getFile({env, path});
  files[path] = file;
  try {
    await Promise.all(_.map(file.requires, path =>
      getFiles({env, files, path})
    ));
    return files;
  } catch (er) {
    const line = `\n  ${path}`;
    if (er.message.indexOf(line) === -1) er.message += line;
    throw er;
  }
};

const walk = ({files, path, visited = {}}) => {
  const file = files[path];
  if (visited[path]) return file;

  visited[path] = true;
  const graph = _.map(file.requires, path => walk({files, path, visited}));
  return _.unique(_.flatten(graph));
};

module.exports = async ({env, path}) =>
  walk({files: await getFiles({env, path}), path});
