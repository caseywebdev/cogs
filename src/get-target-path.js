import crypto from 'crypto';
import { extname, join, relative } from 'path';

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
  path = join(dir, relative(base, path).replace(/\.\./g, '__'));
  const newExt = ext[extname(path)];
  if (newExt != null) path = setExt(path, newExt);
  if (fingerprint) path = setExt(path, `~${getHash(buffer)}${extname(path)}`);
  return path;
};
