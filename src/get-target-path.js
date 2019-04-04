const crypto = require('crypto');
const npath = require('npath');
const setExt = require('./set-ext');

const getHash = buffer => {
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
};

module.exports = ({
  buffer,
  path,
  target: { base = '.', dir = '.', ext = {}, fingerprint = false } = {}
}) => {
  const oldExt = npath.extname(path);
  return setExt(
    npath.join(dir, npath.relative(base, path).replace(/\.\./g, '__')),
    (fingerprint ? `-${getHash(buffer)}` : '') + (ext[oldExt] || oldExt)
  );
};
