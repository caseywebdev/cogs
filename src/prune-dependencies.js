var _ = require('underscore');

var reject = function (visited, dependency) {
  return _.any(visited, {path: dependency.path});
};

module.exports = function (file) {
  var includes, links;
  return _.extend({}, file, {
    includes: includes = _.unique(file.includes, 'path'),
    links: links = _.reject(
      _.unique(file.links, 'path'),
      _.partial(reject, includes)
    ),
    globs: _.reject(
      _.unique(file.globs, 'path'),
      _.partial(reject, includes.concat(links))
    )
  });
};
