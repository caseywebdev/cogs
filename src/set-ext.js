import { getExt } from '#src/get-ext.js';

export default (path, newExt) =>
  `${path.slice(0, path.length - getExt(path).length)}${newExt}`;
