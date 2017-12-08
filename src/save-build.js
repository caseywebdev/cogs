const _ = require('underscore');
const {promisify} = require('util');
const fs = require('fs');
const getBuffer = require('./get-buffer');
const getTargetPath = require('./get-target-path');
const npath = require('npath');

const mkdirp = promisify(require('mkdirp'));
const writeFile = promisify(fs.writeFile);

module.exports = async ({build, target}) => {
  const targetPath = getTargetPath({build, target});
  if (targetPath === build.path) {
    throw new Error(`Refusing to overwrite ${targetPath}`);
  }

  const targetBuffer = await getBuffer(build.targetPath).catch(_.noop);
  const didChange = !targetBuffer || build.compare(targetBuffer) !== 0;
  if (didChange) {
    await mkdirp(npath.dirname(targetPath));
    await writeFile(targetPath, build.buffer);
  }

  return {didChange, targetPath};
};
