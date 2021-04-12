import _ from 'underscore';

import applyTransformers from './apply-transformers.js';
import walk from './walk.js';

const getAllFiles = build =>
  _.reduce(
    build.builds,
    (files, build) => ({ ...files, ...getAllFiles(build) }),
    build.files
  );

const deleteFile = ({ build: { builds, files }, path }) => {
  delete files[path];
  for (const build of builds) deleteFile({ build, path });
};

const resolve = async ({ env, path, buildsSeen = {} }) => {
  if (buildsSeen[path]) return;

  buildsSeen[path] = true;
  const files = _.indexBy(await walk({ env, path }), 'path');
  const builds = _.compact(
    _.flatten(
      await Promise.all(
        _.map(files, file =>
          Promise.all(
            _.map(file.builds, path => resolve({ env, path, buildsSeen }))
          )
        )
      )
    )
  );

  const filesSeen = {};
  for (const build of builds) {
    for (const [path, file] of Object.entries(getAllFiles(build))) {
      if (files[path]) {
        deleteFile({ build, path });
      } else if (filesSeen[path]) {
        files[path] = file;
        deleteFile({ build: filesSeen[path], path });
        deleteFile({ build, path });
        delete filesSeen[path];
      } else {
        filesSeen[path] = build;
      }
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
