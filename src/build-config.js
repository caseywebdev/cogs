import { promisify } from 'util';

import _glob from 'glob';
import npath from 'npath';
import _ from 'underscore';

import getBuild from './get-build.js';
import maybeWrite from './maybe-write.js';
import setExt from './set-ext.js';
import sortObj from './sort-obj.js';
import writeBuffer from './write-buffer.js';

const glob = promisify(_glob);

const flattenBuilds = build =>
  [].concat(build, ..._.map(build.builds, flattenBuilds));

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

const saveBuilds = ({ env, manifest, onError, onResult }) =>
  Promise.all(
    _.map(env.builds, async (target, pattern) => {
      return Promise.all(
        _.map(await glob(pattern, { nodir: true }), async path => {
          try {
            const builds = flattenBuilds(await getBuild({ env, path, target }));
            await Promise.all(
              _.map(builds, async build => {
                await saveBuild({ build, manifest, onError, onResult, target });
              })
            );
          } catch (error) {
            await onError({ error, sourcePath: path });
          }
        })
      );
    })
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
