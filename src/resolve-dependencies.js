var _ = require('underscore');
var async = require('async');
var getFile = require('./get-file');

var getFiles = function (filePath, cb, files) {
  if (!files) files = {};
  if (files[filePath]) return cb();
  files[filePath] = true;
  async.waterfall([
    _.partial(getFile, filePath),
    function (file, cb) {
      files[filePath] = file;
      var filePaths = _.map(file.requires.concat(file.links), 'path');
      async.each(filePaths, _.partial(getFiles, _, _, files), cb);
    }
  ], function (er) {
    if (!er) return cb(null, files);
    var line = '\n  ' + filePath;
    if (er.message.indexOf(line) === -1) er.message += line;
    cb(er);
  });
};

var walk = function (filePath, type, files, visited) {
  if (!visited) visited = {};
  var file = files[filePath];
  if (visited[filePath]) return file;
  visited[filePath] = true;
  var filePaths = _.map(file.requires, 'path').concat(
    type === 'links' ? _.map(file.links, 'path') : []
  );
  var graph = _.map(filePaths, _.partial(walk, _, type, files, visited));
  return _.unique(_.flatten(graph));
};

module.exports = function (filePath, cb) {
  async.waterfall([
    _.partial(getFiles, filePath),
    function (files, cb) {
      var requires = walk(filePath, 'requires', files);
      var links = walk(filePath, 'links', files);
      var globs = _.unique(_.flatten(_.map(requires.concat(links), 'globs')));
      cb(null, {requires: requires, links: links, globs: globs});
    }
  ], cb);
};
