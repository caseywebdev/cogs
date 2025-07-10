import npath from 'path';

import _ from 'underscore';
import { watch } from 'watchy';

import buildConfig from './build-config.js';
import bustCache from './bust-cache.js';
import getConfig from './get-config.js';

export default async ({
  configPath = 'cogs.js',
  debounce = 0.1,
  onError = _.noop,
  onEnd = _.noop,
  onResult = _.noop,
  onStart = _.noop,
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
        _.map(Array.from(paths), path => bustCache({ config, path }))
      );
    }

    if (!config) config = await getConfig(configPath);
    await onStart();
    await buildConfig({
      config,
      onResult: async result => {
        const { didChange, targetPath } = result;
        if (didChange) await bustCache({ config, path: targetPath });
        return onResult(result);
      }
    });
    await onEnd();

    building = false;

    if (changedPaths.size) await build();
  };

  if (!watchPaths.length) return build();

  const tryBuild = async () => {
    try {
      await build();
    } catch (er) {
      await onError(er);
    }
  };

  const handleChangedPath = ({ path }) => {
    changedPaths.add(npath.relative('.', path));
    if (!debounce) return tryBuild();

    clearTimeout(timeoutId);
    timeoutId = setTimeout(tryBuild, debounce * 1000);
  };

  const closeWatcher = watch({
    onChange: handleChangedPath,
    patterns: [].concat(configPath, watchPaths)
  });

  await tryBuild();

  return closeWatcher;
};
