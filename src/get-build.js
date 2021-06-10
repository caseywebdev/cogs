import _ from 'underscore';

import applyTransformers from './apply-transformers.js';
import walk from './walk.js';

const getAllFiles = build => [
  ...Object.values(build.files).map(file => ({ build, file })),
  ...build.builds.flatMap(getAllFiles)
];

const resolve = async ({ env, path, seen = new Set() }) => {
  if (seen.has(path)) return { builds: [], files: [], path };

  seen.add(path);
  let files = await walk({ env, path });
  const builds = await Promise.all(
    files.flatMap(({ builds }) =>
      builds.map(path => resolve({ env, path, seen: new Set(seen) }))
    )
  );

  files = _.indexBy(files, 'path');
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

  return { builds, files, path };
};

const setBuffers = async ({ build, maxChunkSize, transformers }) => {
  const { builds, files, path } = build;
  delete build.files;
  await Promise.all(
    builds.map(build => setBuffers({ build, maxChunkSize, transformers }))
  );
  let size = 0;
  let buffers = [];
  build.buffers = [];
  for (const path in files) {
    const { buffer } = files[path];
    if (size && maxChunkSize && size + buffer.length > maxChunkSize) {
      build.buffers.push(Buffer.concat(buffers));
      size = 0;
      buffers = [];
    }
    size += buffer.length;
    buffers.push(buffer);
  }
  if (buffers.length) build.buffers.push(Buffer.concat(buffers));

  build.buffers = await Promise.all(
    build.buffers.map(
      async buffer =>
        (
          await applyTransformers({
            file: { buffer, builds: [], links: [], path, requires: [path] },
            transformers
          })
        ).buffer
    )
  );
};

export default async ({ env, maxChunkSize, path, transformers }) => {
  const build = await resolve({ env, path });
  await setBuffers({ build, maxChunkSize, transformers });
  return build;
};
