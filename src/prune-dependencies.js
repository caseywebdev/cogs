var _ = require('underscore');

var reject = function (visited, dependency) {
  return _.any(visited, {path: dependency.path});
};

module.exports = function (file) {
  var requires, links;
  return _.extend({}, file, {
    requires: requires = _.unique(file.requires, 'path'),
    links: links = _.reject(
      _.unique(file.links, 'path'),
      _.partial(reject, requires)
    ),
    globs: _.reject(
      _.unique(file.globs, 'path'),
      _.partial(reject, requires.concat(links))
    )
  });
};
