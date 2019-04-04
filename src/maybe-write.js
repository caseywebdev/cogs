const { promisify } = require('util');
const fs = require('fs');
const _ = require('underscore');
const npath = require('npath');
const mkdirp = promisify(require('mkdirp'));
const getBuffer = require('./get-buffer');

const writeFile = promisify(fs.writeFile);

module.exports = async ({ buffer, targetPath }) => {
  const targetBuffer = await getBuffer(targetPath).catch(_.noop);
  if (targetBuffer && buffer.compare(targetBuffer) === 0) return false;

  await mkdirp(npath.dirname(targetPath));
  await writeFile(targetPath, buffer);
  return true;
};
