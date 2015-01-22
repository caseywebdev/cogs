var _ = require('underscore');
var path = require('path');
var getExt = require('./get-ext');
var getOutExt = require('./get-out-ext');

var GLOB = /[{*].*/;
var DUMMY = 'dummy';

module.exports = function (file, sourceGlob, target) {
  if (_.isString(target)) target = {dir: target};
  var ext = getExt(file.path);
  var filePath =
    (ext ? file.path.slice(0, -ext.length - 1) : file.path) +
    (target.fingerprint ? '-' + file.hash : '') +
    (ext ? '.' + getOutExt(ext) : '');
  return path.join(
    target.dir,
    path.relative(
      path.dirname(path.resolve(sourceGlob || filePath).replace(GLOB, DUMMY)),
      filePath
    )
  );
};
