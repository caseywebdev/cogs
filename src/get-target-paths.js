'use strict';

var _ = require('underscore');
var path = require('path');
const setExt = require('./set-ext');

var GLOB = /([*{]|[?+@!]\().*/;
var DUMMY = 'dummy';

module.exports = function (build, sourceGlob, target, cb) {
  if (!target) return cb();

  if (target.fn) return target.fn(build, sourceGlob, cb);

  if (_.isString(target)) target = {path: target};

  let filePath;
  if (target.path) filePath = target.path;
  else {
    filePath = build.path;
    if (target.dir) {
      filePath = path.join(
        target.dir,
        path.relative(
          path.dirname(path.resolve(sourceGlob).replace(GLOB, DUMMY)),
          filePath
        )
      );
    }
    if (target.ext) {
      filePath = setExt(filePath, target.ext[path.extname(filePath)]);
    }
  }

  if (target.fingerprint) {
    filePath = setExt(filePath, `-${build.hash}${path.extname(filePath)}`);
  }

  if (filePath === build.path) {
    return cb(new Error(`Refusing to overwite ${build.path}`));
  }

  return cb(null, filePath);
};
