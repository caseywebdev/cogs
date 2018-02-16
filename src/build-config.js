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

  let error = false;

  const handleError = async er => {
    error = true;
    await onResult({type: 'failed', error: er});
  };

  const saveManifest = async ({manifest, manifestPath}) => {
    if (!manifestPath) return;

    const buffer = Buffer.from(JSON.stringify(sortObj(manifest)));
    const targetPath = manifestPath;
    const didChange = await maybeWrite({buffer, targetPath});
    const type = didChange ? 'changed' : 'unchanged';
    const sourcePath = '[manifest]';
    const size = buffer.length;
    await onResult({type, size, sourcePath, targetPath: manifestPath});
  };

  await Promise.all(_.map(config.envs, async env => {
    const envManifest = {};
    await Promise.all(_.map(env.builds, async (target, pattern) =>
      Promise.all(_.map(await glob(pattern, {nodir: true}), async path => {
        try {
          const builds = flattenBuilds(await getBuild({env, path}));
          await Promise.all(_.map(builds, async build => {
            try {
              const {didChange, targetPath} = await writeBuild({build, target});
              envManifest[build.path] = targetPath;
              const type = didChange ? 'changed' : 'unchanged';
              const size = build.buffer.length;
              await onResult({type, size, sourcePath: build.path, targetPath});
            } catch (er) { await handleError(er); }
          }));
        } catch (er) { await handleError(er); }
      }))
    ));

    if (error) return;

    const {manifestPath, then} = env;
    await saveManifest({manifest: envManifest, manifestPath});
    await buildConfig({config: then, configManifest: envManifest, onResult});

    _.extend(configManifest, envManifest);
  }));

  if (error) return;

  const {manifestPath, then} = config;
  await saveManifest({manifest: configManifest, manifestPath});
  await buildConfig({config: then, configManifest, onResult});
};

module.exports = buildConfig;
