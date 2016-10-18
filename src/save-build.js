const _ = require('underscore');
const fs = require('fs');
const getBuffer = require('./get-buffer');
const getBuild = require('./get-build');
const getTargetPath = require('./get-target-path');
const npath = require('npath');
const Promise = require('better-promise').default;

const mkdirp = Promise.promisify(require('mkdirp'));
const writeFile = Promise.promisify(fs.writeFile);

const write = (path, buffer) =>
  mkdirp(npath.dirname(path)).then(() => writeFile(path, buffer));

module.exports = ({env, path, pattern, target}) => {
  const targetPath = getTargetPath({path, pattern, target});
  return Promise.all([
    getBuild({env, path}),
    getBuffer(targetPath).catch(_.noop)
  ]).then(([build, targetBuffer]) => {
    const didChange = !targetBuffer || build.buffer.compare(targetBuffer) !== 0;

    return Promise.resolve(didChange ? write(targetPath, build.buffer) : null)
      .then(() => ({build, didChange, targetPath}));
  });
};
