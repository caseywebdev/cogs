const _ = require('underscore');
const fileHasDependency = require('./file-has-dependency');

const bustCache = async ({config: {envs, then}, path}) => {
  await Promise.all(_.map(envs, async ({cache, then}) => {
    const {buffers, files} = cache;
    delete buffers[path];
    delete files[path];
    await Promise.all(_.map(files, async (file, key) => {
      if (fileHasDependency({file: await file, path})) delete files[key];
    }));

    if (then) await bustCache({config: then, path});
  }));

  if (then) await bustCache({config: then, path});
};

module.exports = bustCache;
