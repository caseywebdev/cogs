import crypto from 'crypto';
import { join, relative } from 'path';

import { getExt } from '#src/get-ext.js';
import setExt from '#src/set-ext.js';

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
  const oldExt = getExt(path);
  return setExt(
    join(dir, relative(base, path).replace(/\.\./g, '__')),
    (fingerprint ? `~${getHash(buffer)}` : '') + (ext[oldExt] ?? oldExt)
  );
};
