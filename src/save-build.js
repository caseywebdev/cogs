const _ = require('underscore');
const {promisify} = require('util');
const fs = require('fs');
const getBuffer = require('./get-buffer');
const getBuild = require('./get-build');
const getTargetPath = require('./get-target-path');
const npath = require('npath');

const mkdirp = promisify(require('mkdirp'));
const writeFile = promisify(fs.writeFile);

const write = async (path, buffer) => {
  await mkdirp(npath.dirname(path));
  return writeFile(path, buffer);
};

module.exports = async ({env, path, pattern, target}) => {
  const targetPath = getTargetPath({path, pattern, target});
  const [build, targetBuffer] = await Promise.all([
    getBuild({env, path}),
    getBuffer(targetPath).catch(_.noop)
  ]);
  const didChange = !targetBuffer || build.compare(targetBuffer) !== 0;
  if (didChange) await write(targetPath, build);
  return {build, didChange, targetPath};
};
