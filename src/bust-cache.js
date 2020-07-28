import _ from 'underscore';

import fileHasDependency from './file-has-dependency.js';

export default ({ config, path }) =>
  Promise.all(
    _.map(config, async ({ cache }) => {
      const { buffers, files } = cache;
      delete buffers[path];
      delete files[path];
      await Promise.all(
        _.map(files, async (file, key) => {
          if (fileHasDependency({ file: await file, path })) delete files[key];
        })
      );
    })
  );
