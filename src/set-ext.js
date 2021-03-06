import npath from 'path';

export default (path, newExt) => {
  if (!newExt) return path;

  const oldExt = npath.extname(path);
  if (oldExt) path = path.slice(0, -oldExt.length);
  return path + newExt;
};
