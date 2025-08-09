import fs from 'node:fs/promises';
import npath from 'node:path';

import _ from 'underscore';

import getBuilds from './get-builds.js';
import maybeWrite from './maybe-write.js';
import setExt from './set-ext.js';
import sortObj from './sort-obj.js';
import writeBuffer from './write-buffer.js';

const { Buffer } = globalThis;

const saveManifest = async ({ env, manifest, onError, onResult }) => {
  const { manifestPath } = env;
  if (!manifestPath) return;

  const buffer = Buffer.from(JSON.stringify(sortObj(manifest)));
  const size = buffer.length;
  const sourcePath = `[manifest:${env.name}]`;
  const targetPath = manifestPath;
  try {
    const didChange = await maybeWrite({ buffer, targetPath });
    await onResult({ didChange, size, sourcePath, targetPath });
  } catch (error) {
    await onError({ error, sourcePath });
  }
};

const saveBuild = async ({
  build: { buffers, path },
  manifest,
  onError,
  onResult,
  target
}) => {
  manifest[path] = await Promise.all(
    buffers.map(async (buffer, i) => {
      const size = buffer.length;
      const sourcePath =
        i === 0 ? path : setExt(path, `~${i + 1}${npath.extname(path)}`);
      try {
        const { didChange, targetPath } = await writeBuffer({
          buffer,
          path: sourcePath,
          target
        });
        await onResult({ didChange, size, sourcePath, targetPath });
        return targetPath;
      } catch (error) {
        await onError({ error, sourcePath });
      }
    })
  );
};

const getPaths = async pattern => {
  const paths = [];
  for await (const dirent of fs.glob(pattern, { withFileTypes: true })) {
    if (!dirent.isDirectory()) {
      paths.push(
        npath.relative('.', npath.join(dirent.parentPath, dirent.name))
      );
    }
  }
  return paths.sort();
};

const saveBuilds = async ({ env, manifest, onError, onResult }) =>
  await Promise.all(
    _.map(
      env.builds,
      async (target, pattern) =>
        await Promise.all(
          (await getPaths(pattern)).map(async path => {
            try {
              await Promise.all(
                (
                  await getBuilds({
                    env,
                    maxChunkSize: target.maxChunkSize,
                    path,
                    transformers: target.transformers
                  })
                ).map(async build => {
                  await saveBuild({
                    build,
                    manifest,
                    onError,
                    onResult,
                    target
                  });
                })
              );
            } catch (error) {
              await onError({ error, sourcePath: path });
            }
          })
        )
    )
  );

const buildConfig = async ({ built, config, onResult, started }) => {
  let failed = false;

  const onError = async ({ error, sourcePath }) => {
    failed = true;
    await onResult({ error, sourcePath });
  };

  await Promise.all(
    _.map(config, async env => {
      if (started.has(env) || !_.all(env.requires, env => built.has(env))) {
        return;
      }

      started.add(env);
      const manifest = {};

      await saveBuilds({ env, manifest, onError, onResult });
      if (failed) return;

      await saveManifest({ env, manifest, onError, onResult });
      if (failed) return;

      built.add(env);
      await buildConfig({ built, config, onResult, started });
    })
  );
};

export default ({ config, onResult = _.noop }) =>
  buildConfig({ built: new Set(), config, onResult, started: new Set() });
