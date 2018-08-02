const _ = require('underscore');
const {promisify} = require('util');
const getBuild = require('./get-build');
const maybeWrite = require('./maybe-write');
const sortObj = require('./sort-obj');
const writeBuild = require('./write-build');

const glob = promisify(require('glob'));

const flattenBuilds = build =>
  [].concat(build, ..._.map(build.builds, flattenBuilds));

const saveManifest = async ({config, env, manifest, onError, onResult}) => {
  const {manifestPath} = env;
  if (!manifestPath) return;

  const buffer = Buffer.from(JSON.stringify(sortObj(manifest)));
  const size = buffer.length;
  const sourcePath = `[manifest:${config.indexOf(env)}]`;
  const targetPath = manifestPath;
  try {
    const didChange = await maybeWrite({buffer, targetPath});
    await onResult({didChange, size, sourcePath, targetPath});
  } catch (error) {
    await onError({error, sourcePath});
  }
};

const saveBuild = async ({build, manifest, onError, onResult, target}) => {
  const size = build.buffer.length;
  const sourcePath = build.path;
  try {
    const {didChange, targetPath} = await writeBuild({build, target});
    manifest[sourcePath] = targetPath;
    await onResult({didChange, size, sourcePath, targetPath});
  } catch (error) { await onError({error, sourcePath}); }
};

const saveBuilds = async ({env, manifest, onError, onResult}) =>
  Promise.all(_.map(env.builds, async (target, pattern) =>
    Promise.all(_.map(await glob(pattern, {nodir: true}), async path => {
      try {
        const builds = flattenBuilds(await getBuild({env, path}));
        await Promise.all(_.map(builds, async build => {
          await saveBuild({build, manifest, onError, onResult, target});
        }));
      } catch (error) {
        await onError({error, sourcePath: path});
      }
    }))
  ));

const buildConfig = async ({built, config, onResult, started}) => {
  let failed = false;

  const onError = async ({error, sourcePath}) => {
    failed = true;
    await onResult({error, sourcePath});
  };

  await Promise.all(_.map(config, async env => {
    if (started.has(env) || !_.all(env.requires, env => built.has(env))) return;

    started.add(env);
    const manifest = {};

    await saveBuilds({env, manifest, onError, onResult});
    if (failed) return;

    await saveManifest({config, env, manifest, onError, onResult});
    if (failed) return;

    built.add(env);
    await buildConfig({built, config, onResult, started});
  }));
};

module.exports = async ({config, onResult = _.noop}) =>
  await buildConfig({built: new Set(), config, onResult, started: new Set()});
