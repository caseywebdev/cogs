import _ from 'underscore';

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

const setBuffers = ({ build, maxChunkSize }) => {
  const { builds, files } = build;
  delete build.files;
  for (const build of builds) setBuffers({ build, maxChunkSize });
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
};

export default async ({ env, maxChunkSize, path }) => {
  const build = await resolve({ env, path });
  setBuffers({ build, maxChunkSize });
  return build;
};
