import getTargetPath from './get-target-path.js';
import maybeWrite from './maybe-write.js';

export default async ({ buffer, path, target }) => {
  const targetPath = getTargetPath({ buffer, path, target });

  if (targetPath === path) throw new Error(`Refusing to overwrite ${path}`);

  return { didChange: await maybeWrite({ buffer, targetPath }), targetPath };
};
