const _ = require('underscore');
const {promisify} = require('util');
const getBuild = require('./get-build');
const maybeWrite = require('./maybe-write');
const sortObj = require('./sort-obj');
const writeBuild = require('./write-build');

const glob = promisify(require('glob'));

const flattenBuilds = build =>
  [].concat(build, ..._.map(build.builds, flattenBuilds));

const buildConfig = async ({
  config,
  configManifest = {},
  onResult = _.noop
}) => {
  if (!config) return;

  let failed = false;

  const handleError = async ({error, sourcePath}) => {
    failed = true;
    await onResult({error, sourcePath});
  };

  const saveManifest = async ({manifest, manifestPath}) => {
    if (!manifestPath) return;

    const buffer = Buffer.from(JSON.stringify(sortObj(manifest)));
    const size = buffer.length;
    const sourcePath = '[manifest]';
    const targetPath = manifestPath;
    try {
      const didChange = await maybeWrite({buffer, targetPath});
      await onResult({didChange, size, sourcePath, targetPath});
    } catch (error) {
      await handleError({error, sourcePath});
    }
  };

  await Promise.all(_.map(config.envs, async env => {
    const envManifest = {};
    await Promise.all(_.map(env.builds, async (target, pattern) =>
      Promise.all(_.map(await glob(pattern, {nodir: true}), async path => {
        try {
          const builds = flattenBuilds(await getBuild({env, path}));
          await Promise.all(_.map(builds, async build => {
            const size = build.buffer.length;
            const sourcePath = build.path;
            try {
              const {didChange, targetPath} = await writeBuild({build, target});
              envManifest[sourcePath] = targetPath;
              await onResult({didChange, size, sourcePath, targetPath});
            } catch (error) { await handleError({error, sourcePath}); }
          }));
        } catch (error) { await handleError({error, sourcePath: path}); }
      }))
    ));

    if (failed) return;

    const {manifestPath, then} = env;
    await saveManifest({manifest: envManifest, manifestPath});
    if (failed) return;

    await buildConfig({config: then, configManifest: envManifest, onResult});

    _.extend(configManifest, envManifest);
  }));

  if (failed) return;

  const {manifestPath, then} = config;
  await saveManifest({manifest: configManifest, manifestPath});
  if (failed) return;

  await buildConfig({config: then, configManifest, onResult});
};

module.exports = buildConfig;
