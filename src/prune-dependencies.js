var _ = require('underscore');

module.exports = function (file) {
  var requires;
  return _.extend({}, file, {
    requires: requires = _.unique(file.requires),
    links: _.difference(_.unique(file.links), requires),
    globs: _.unique(file.globs)
  });
};
