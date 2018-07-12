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
    building = true;
    try {
      if (!config) config = await getConfig(configPath);
      await onStart();
      await buildConfig({config, onResult});
      await onEnd();
    } catch (er) {
      await onError(er);
    }
    building = false;
  };

  const maybeBuild = async () => {
    if (building) return;

    const paths = changedPaths;
    changedPaths = new Set();
    if (paths.has(configPath)) {
      config = null;
    } else if (config) {
      await Promise.all(
        Array.from(paths).map(async path => bustCache({config, path}))
      );
    }

    await build();

    if (changedPaths.size) await maybeBuild();
  };

  const safeMaybeBuild = async () => {
    try { await maybeBuild(); } catch (er) { onError(er); }
  };

  const handleChangedPath = async ({path}) => {
    changedPaths.add(npath.relative('.', path));
    if (!debounce) return await safeMaybeBuild();

    clearTimeout(timeoutId);
    timeoutId = setTimeout(safeMaybeBuild, debounce * 1000);
  };

  const watcher = watchPaths.length > 0 && await watchy({
    onError,
    onChange: handleChangedPath,
    patterns: [].concat(configPath, watchPaths),
    usePolling
  });

  await build();

  return watcher;
};
