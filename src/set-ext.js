const npath = require('npath');

module.exports = (path, newExt) => {
  if (!newExt) return path;

  const oldExt = npath.extname(path);
  if (oldExt) path = path.slice(0, -oldExt.length);
  return path + newExt;
};
