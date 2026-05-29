import { promises as fs } from 'fs';
import npath from 'node:path';

export default async ({ buffer, targetPath }) => {
  const targetBuffer = await fs.readFile(targetPath).catch(() => {});
  if (targetBuffer && buffer.compare(targetBuffer) === 0) return false;

  await fs.mkdir(npath.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, buffer);
  return true;
};
