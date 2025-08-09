import _ from 'underscore';

import applyTransformers from './apply-transformers.js';
import walk from './walk.js';

const { Buffer } = globalThis;

const getSharedParent = (a, b) => {
  while (a.depth > b.depth) a = a.parent;
  while (b.depth > a.depth) b = b.parent;
  while (a !== b) [a, b] = [a.parent, b.parent];
  return a;
};

const resolve = async ({ env, path }, parent, depth = 0, cache = new Map()) => {
  if (cache.has(path)) {
    const build = cache.get(path);
    if (build.parent) {
      parent = getSharedParent(build.parent, parent);
      if (build.parent !== parent) {
        build.parent.builds.delete(build);
        parent.builds.add(build);
        build.parent = parent;
        build.depth = build.parent.depth + 1;
      }
    }
    return build;
  }

  const build = { builds: new Set(), depth, parent, path };
  parent?.builds.add(build);
  cache.set(path, build);

  const files = await walk({ env, path });
  await Promise.all(
    files.flatMap(({ builds }) =>
      builds.map(path => resolve({ env, path }, build, depth + 1, cache))
    )
  );
  build.files = _.indexBy(files, 'path');
  return build;
};

const getAllFiles = build => [
  ...Object.values(build.files).map(file => ({ build, file })),
  ...[...build.builds].flatMap(getAllFiles)
];

const prune = ({ builds, files }) => {
  builds.forEach(prune);

  const seenFiles = {};
  for (const build of builds) {
    for (const { build: fileBuild, file } of getAllFiles(build)) {
      const { path } = file;
      if (files[path]) delete fileBuild.files[path];
      else if (seenFiles[path] && seenFiles[path].path !== fileBuild.path) {
        files[path] = file;
        delete fileBuild.files[path];
        delete seenFiles[path].files[path];
        delete seenFiles[path];
      } else seenFiles[path] = fileBuild;
    }
  }
};

const getBuffers = async ({ files, maxChunkSize, path, transformers }) => {
  let size = 0;
  let chunks = [];
  const buffers = [];
  for (const path in files) {
    const { buffer } = files[path];
    if (size && maxChunkSize && size + buffer.length > maxChunkSize) {
      buffers.push(Buffer.concat(chunks));
      size = 0;
      chunks = [];
    }
    size += buffer.length;
    chunks.push(buffer);
  }
  if (chunks.length) buffers.push(Buffer.concat(chunks));

  return {
    path,
    buffers: await Promise.all(
      buffers.map(
        async buffer =>
          (
            await applyTransformers({
              file: { buffer, builds: [], links: [], path, requires: [path] },
              transformers
            })
          ).buffer
      )
    )
  };
};

const flattenBuilds = build => [
  build,
  ...[...build.builds].flatMap(flattenBuilds)
];

export default async ({ env, maxChunkSize, path, transformers }) => {
  const build = await resolve({ env, path });
  prune(build);
  return await Promise.all(
    flattenBuilds(build).map(({ path, files }) =>
      getBuffers({ files, maxChunkSize, path, transformers })
    )
  );
};
