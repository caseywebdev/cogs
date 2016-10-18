const _ = require('underscore');
const npath = require('npath');
const setExt = require('./set-ext');

var GLOB = /([*{]|[?+@!]\().*/;
var DUMMY = 'dummy';

module.exports = ({path, pattern, target}) => {
  if (!target) throw new Error(`No target specified for ${path}`);

  if (_.isString(target)) target = {path: target};

  let targetPath;
  if (target.path) targetPath = target.path;
  else {
    targetPath = path;
    if (target.dir) {
      targetPath = npath.join(
        target.dir,
        npath.relative(
          npath.dirname(npath.resolve(pattern).replace(GLOB, DUMMY)),
          targetPath
        )
      );
    }

    if (target.ext) {
      targetPath = setExt(targetPath, target.ext[npath.extname(targetPath)]);
    }
  }

  if (targetPath === path) {
    throw new Error(`Refusing to overwrite ${path}`);
  }

  return targetPath;
};
