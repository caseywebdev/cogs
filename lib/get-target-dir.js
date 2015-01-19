var _ = require('underscore');
var path = require('path');

var GLOB = /[{*].*/;
var DUMMY = 'dummy';

module.exports = _.memoize(function (filePath, sourceGlob, targetDir) {
  return path.join(
    targetDir,
    path.relative(
      path.dirname(path.resolve(sourceGlob).replace(GLOB, DUMMY)),
      path.dirname(filePath)
    )
  );
}, function (filePath, sourceGlob, targetDir) {
  return [filePath, sourceGlob, targetDir].join(':');
});
