const { promisify } = require('util');

const _ = require('underscore');
const glob = promisify(require('glob'));

const getBuild = require('./get-build');
const maybeWrite = require('./maybe-write');
const setExt = require('./set-ext');
const sortObj = require('./sort-obj');
const writeBuffer = require('./write-buffer');

const npath = require('npath');

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

const saveBuild = async ({ build, manifest, onError, onResult, target }) => {
  manifest[build.path] = await Promise.all(
    build.buffers.map(async (buffer, i) => {
      const size = buffer.length;
      const sourcePath =
        i === 0
          ? build.path
          : setExt(build.path, `-${i + 1}${npath.extname(build.path)}`);
      try {
        const { didChange, targetPath } = await writeBuffer({ build, target });
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
      const { transformers } = target;
      return Promise.all(
        _.map(await glob(pattern, { nodir: true }), async path => {
          try {
            const builds = flattenBuilds(
              await getBuild({ env, path, transformers })
            );
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

module.exports = ({ config, onResult = _.noop }) =>
  buildConfig({ built: new Set(), config, onResult, started: new Set() });
