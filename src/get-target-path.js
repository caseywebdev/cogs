'use strict';

var _ = require('underscore');
var path = require('path');
var getTransformedPath = require('./get-transformed-path');
const setExt = require('./set-ext');

var GLOB = /([*{]|[?+@!]\().*/;
var DUMMY = 'dummy';

module.exports = function (file, sourceGlob, target) {
  if (_.isString(target)) target = {dir: target};
  let filePath = getTransformedPath(file.path);
  if (target.fingerprint) {
    filePath = setExt(filePath, `-${file.hash}${path.extname(filePath)}`);
  }
  return path.join(
    target.dir,
    path.relative(
      path.dirname(path.resolve(sourceGlob || filePath).replace(GLOB, DUMMY)),
      filePath
    )
  );
};
