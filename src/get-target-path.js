const npath = require('npath');
const setExt = require('./set-ext');

module.exports = ({
  build: {hash, path},
  target: {base = '.', dir = '.', ext = {}, fingerprint = false} = {}
}) => {
  const oldExt = npath.extname(path);
  return setExt(
    npath.join(dir, npath.relative(base, path).replace(/\.\./g, '__')),
    (fingerprint ? `-${hash}` : '') + (ext[oldExt] || oldExt)
  );
};
