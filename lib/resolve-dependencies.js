var _ = require('underscore');
var async = require('async');
var getFile = require('./get-file');

module.exports = function (filePath, config, type, cb, visited) {
  if (!visited) visited = {};
  if (visited[filePath]) return getFile(filePath, config, cb);
  visited[filePath] = true;
  async.waterfall([
    _.partial(getFile, filePath, config),
    function (file, cb) {
      var dependencies = file[type];
      if (type === 'links') dependencies = file.includes.concat(dependencies);
      async.map(
        _.map(dependencies, 0),
        _.partial(module.exports, _, config, type, _, visited),
        cb
      );
    },
    function (files, cb) { cb(null, _.unique(_.flatten(files), 'path')); }
  ], cb);
};
