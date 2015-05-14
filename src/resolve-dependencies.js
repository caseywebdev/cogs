var _ = require('underscore');
var async = require('async');
var getFile = require('./get-file');
var pruneDependencies = require('./prune-dependencies');

var getFiles = function (filePath, cb, files) {
  if (!files) files = {};
  if (files[filePath]) return cb();
  files[filePath] = true;
  async.waterfall([
    _.partial(getFile, filePath),
    function (file, cb) {
      files[filePath] = file;
      async.each(file.requires, _.partial(getFiles, _, _, files), cb);
    }
  ], function (er) {
    if (!er) return cb(null, files);
    var line = '\n  ' + filePath;
    if (er.message.indexOf(line) === -1) er.message += line;
    cb(er);
  });
};

var walk = function (filePath, files, visited) {
  if (!visited) visited = {};
  var file = files[filePath];
  if (visited[filePath]) return file;
  visited[filePath] = true;
  var graph = _.map(file.requires, _.partial(walk, _, files, visited));
  return _.unique(_.flatten(graph), 'path');
};

module.exports = function (filePath, cb) {
  async.waterfall([
    _.partial(getFiles, filePath),
    function (files, cb) {
      var requires = walk(filePath, files);
      cb(null, _.extend(pruneDependencies({
        requires: _.map(requires, 'path'),
        links: _.flatten(_.map(requires, 'links')),
        globs: _.flatten(_.map(requires, 'globs'))
      }), {requires: requires}));
    }
  ], cb);
};
