var path = require('path');
var getExt = require('./get-ext');
var getOutExt = require('./get-out-ext');

var GLOB = /[{*].*/;
var DUMMY = 'dummy';

module.exports = function (filePath, sourceGlob, targetDir, config) {
  var ext = getExt(filePath);
  filePath = filePath.slice(0, -ext.length) + getOutExt(ext, config);
  return path.join(
    targetDir,
    path.relative(
      path.dirname(path.resolve(sourceGlob || filePath).replace(GLOB, DUMMY)),
      filePath
    )
  );
};
