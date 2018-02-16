const _ = require('underscore');
const buildConfig = require('./build-config');
const bustCache = require('./bust-cache');
const getConfig = require('./get-config');
const npath = require('npath');
const watchy = require('watchy');

module.exports = async ({
  configPath = 'cogs.js',
  onError = _.noop,
  onEnd = _.noop,
  onResult = _.noop,
  onStart = _.noop,
  usePolling = false,
  watchPaths = []
}) => {
  let config;

  const build = async () => {
    try {
      if (!config) config = await getConfig(configPath);
      await onStart();
      await buildConfig({config, onResult});
      await onEnd();
    } catch (er) {
      await onError(er);
    }
  };

  await build();

  if (!watchPaths.length) return;

  let building = false;
  let changedPaths = [];

  const maybeBuild = async () => {
    if (building) return;

    const paths = changedPaths;
    changedPaths = [];
    if (_.contains(paths, configPath)) {
      config = null;
    } else if (config) {
      await Promise.all(_.map(paths, async path => bustCache({config, path})));
    }

    building = true;
    await build();
    building = false;

    if (changedPaths.length) await maybeBuild();
  };

  const handleChangedPath = async ({path}) => {
    changedPaths.push(npath.relative('.', path));
    try { await maybeBuild(); } catch (er) { await onError(er); }
  };

  return await watchy({
    onError,
    onChange: handleChangedPath,
    patterns: [].concat(configPath, watchPaths),
    usePolling
  });
};
