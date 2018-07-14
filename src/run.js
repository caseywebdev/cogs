const _ = require('underscore');
const buildConfig = require('./build-config');
const bustCache = require('./bust-cache');
const getConfig = require('./get-config');
const npath = require('npath');
const watchy = require('watchy');

module.exports = async ({
  configPath = 'cogs.js',
  debounce = 0.1,
  onError = _.noop,
  onEnd = _.noop,
  onResult = _.noop,
  onStart = _.noop,
  usePolling = false,
  watchPaths = []
}) => {
  let building = false;
  let changedPaths = new Set();
  let config;
  let timeoutId;

  const build = async () => {
    if (building) return;

    building = true;

    const paths = changedPaths;
    changedPaths = new Set();
    if (paths.has(configPath)) {
      config = null;
    } else if (config) {
      await Promise.all(
        Array.from(paths).map(async path => await bustCache({config, path}))
      );
    }

    if (!config) config = await getConfig(configPath);
    await onStart();
    await buildConfig({
      config,
      onResult: async result => {
        const {didChange, targetPath} = result;
        if (didChange) await bustCache({config, path: targetPath});
        return await onResult(result);
      }
    });
    await onEnd();

    building = false;

    if (changedPaths.size) await build();
  };

  if (!watchPaths.length) return await build();

  const tryBuild = async () => {
    try { await build(); } catch (er) { await onError(er); }
  };

  const handleChangedPath = async ({path}) => {
    changedPaths.add(npath.relative('.', path));
    if (!debounce) return await tryBuild();

    clearTimeout(timeoutId);
    timeoutId = setTimeout(tryBuild, debounce * 1000);
  };

  const watcher = await watchy({
    onError,
    onChange: handleChangedPath,
    patterns: [].concat(configPath, watchPaths),
    usePolling
  });

  await tryBuild();

  return watcher;
};
