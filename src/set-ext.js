import { extname } from 'node:path';

export default (path, newExt) =>
  `${path.slice(0, path.length - extname(path).length)}${newExt}`;
