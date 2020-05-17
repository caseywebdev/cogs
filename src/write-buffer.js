const getTargetPath = require('./get-target-path');
const maybeWrite = require('./maybe-write');

module.exports = async ({ buffer, path, target }) => {
  const targetPath = getTargetPath({ buffer, path, target });

  if (targetPath === path) throw new Error(`Refusing to overwrite ${path}`);

  return { didChange: await maybeWrite({ buffer, targetPath }), targetPath };
};
