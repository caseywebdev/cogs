import getFile from './get-file.js';

const getFiles = async ({ env, files = {}, path }) => {
  if (files[path]) return files;

  files[path] = true;
  const file = await getFile({ env, path });

  files[path] = file;
  await Promise.all(file.requires.map(path => getFiles({ env, files, path })));

  return files;
};

const walk = ({ files, path, visited = {} }) => {
  const file = files[path];
  if (visited[path]) return file;

  visited[path] = true;
  const graph = file.requires.map(path => walk({ files, path, visited }));
  return [...new Set(graph.flat(Infinity))];
};

export default async ({ env, path }) =>
  walk({ files: await getFiles({ env, path }), path });
