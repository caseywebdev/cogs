import crypto from 'crypto';
import npath from 'path';

import setExt from './set-ext.js';

const getHash = buffer => {
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex').slice(0, 8);
};

export default ({
  buffer,
  path,
  target: { base = '.', dir = '.', ext = {}, fingerprint = false } = {}
}) => {
  const oldExt = npath.extname(path);
  return setExt(
    npath.join(dir, npath.relative(base, path).replace(/\.\./g, '__')),
    (fingerprint ? `~${getHash(buffer)}` : '') + (ext[oldExt] || oldExt)
  );
};
