var _ = require('underscore');

module.exports = function (file) {
  var requires, links;
  return _.extend({}, file, {
    requires: requires = _.unique(file.requires),
    links: links = _.difference(_.unique(file.links), requires),
    globs: _.difference(_.unique(file.globs), requires.concat(links))
  });
};
