import _ from 'underscore';

import fileHasDependency from './file-has-dependency.js';

export default ({ config, path }) =>
  Promise.all(
    _.map(config, async ({ cache }) => {
      delete cache[path];
      await Promise.all(
        _.map(cache, async (file, key) => {
          if (fileHasDependency({ file: await file, path })) delete cache[key];
        })
      );
    })
  );
