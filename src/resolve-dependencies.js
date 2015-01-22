var _ = require('underscore');
var async = require('async');
var getFile = require('./get-file');

module.exports = function (filePath, type, cb, visited) {
  if (!visited) visited = {};
  if (visited[filePath]) return getFile(filePath, cb);
  visited[filePath] = true;
  async.waterfall([
    _.partial(getFile, filePath),
    function (file, cb) {
      var dependencies = file[type];
      if (type === 'links') dependencies = file.includes.concat(dependencies);
      async.map(
        _.map(dependencies, 'path'),
        _.partial(module.exports, _, type, _, visited),
        cb
      );
    },
    function (files, cb) { cb(null, _.unique(_.flatten(files), 'path')); }
  ], function (er, dependencies) {
    if (!er) return cb(null, dependencies);
    var line = '\n  ' + filePath;
    if (er.message.indexOf(line) === -1) er.message += line;
    cb(er);
  });
};
