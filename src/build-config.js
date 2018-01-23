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
  let error = false;

  const handleError = async er => {
    error = true;
    await onResult({type: 'failed', error: er});
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
              await onResult({type, sourcePath: build.path, targetPath});
            } catch (er) { await handleError(er); }
          }));
        } catch (er) { await handleError(er); }
      }))
    ));

    if (error) return;

    const {manifestPath, then} = env;

    if (manifestPath) {
      const buffer = Buffer.from(JSON.stringify(sortObj(envManifest)));
      const targetPath = manifestPath;
      const didChange = await maybeWrite({buffer, targetPath});
      const type = didChange ? 'changed' : 'unchanged';
      const sourcePath = '[manifest]';
      await onResult({type, sourcePath, targetPath: manifestPath});
    }

    if (then) {
      await buildConfig({config: then, configManifest: envManifest, onResult});
    }

    _.extend(configManifest, envManifest);
  }));

  if (error) return;

  const {manifestPath, then} = config;

  if (manifestPath) {
    const buffer = Buffer.from(JSON.stringify(sortObj(configManifest)));
    const targetPath = manifestPath;
    const didChange = await maybeWrite({buffer, targetPath});
    const type = didChange ? 'changed' : 'unchanged';
    const sourcePath = '[manifest]';
    await onResult({type, sourcePath, targetPath: manifestPath});
  }

  if (then) await buildConfig({config: then, configManifest, onResult});
};

module.exports = buildConfig;
