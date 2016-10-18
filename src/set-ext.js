var npath = require('npath');

module.exports = ({path, ext}) => {
  if (ext == null) return path;

  const prev = npath.extname(path);
  if (prev) path = npath.slice(0, -prev.length);
  return path + ext;
};
