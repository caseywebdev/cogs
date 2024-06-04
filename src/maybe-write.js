import { promises as fs } from 'fs';
import npath from 'path';

import { mkdirp } from 'mkdirp';
import _ from 'underscore';

export default async ({ buffer, targetPath }) => {
  const targetBuffer = await fs.readFile(targetPath).catch(_.noop);
  if (targetBuffer && buffer.compare(targetBuffer) === 0) return false;

  await mkdirp(npath.dirname(targetPath));
  await fs.writeFile(targetPath, buffer);
  return true;
};
