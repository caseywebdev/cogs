var _ = require('underscore');

var reject = function (visited, dependency) {
  return _.any(visited, {'0': dependency[0]});
};

module.exports = function (file) {
  var includes, links;
  return _.extend({}, file, {
    includes: includes = _.unique(file.includes, 0),
    links: links = _.reject(
      _.unique(file.links, 0),
      _.partial(reject, includes)
    ),
    globs: _.reject(
      _.unique(file.globs, 0),
      _.partial(reject, includes.concat(links))
    )
  });
};
