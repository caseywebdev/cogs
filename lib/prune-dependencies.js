var _ = require('underscore');

module.exports = function (file) {
  var includes, links;
  return _.extend({}, file, {
    includes: includes = _.unique(file.includes),
    links: links = _.difference(_.unique(file.links), includes),
    globs: _.difference(_.unique(file.globs), includes, links)
  });
};
