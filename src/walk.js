import _ from 'underscore';

import getFile from './get-file.js';

const getFiles = async ({ env, files = {}, path }) => {
  if (files[path]) return files;

  files[path] = true;
  const file = await getFile({ env, path });

  files[path] = file;
  await Promise.all(
    _.map(file.requires, path => getFiles({ env, files, path }))
  );

  return files;
};

const walk = ({ files, path, visited = {} }) => {
  const file = files[path];
  if (visited[path]) return file;

  visited[path] = true;
  const graph = _.map(file.requires, path => walk({ files, path, visited }));
  return _.unique(_.flatten(graph));
};

export default async ({ env, path }) =>
  walk({ files: await getFiles({ env, path }), path });
