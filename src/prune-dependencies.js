var _ = require('underscore');
const path = require('npath');

const normalize = p => path.normalize(p);
const clean = paths => _.unique(_.map(paths, normalize));

module.exports = function (file) {
  var requires;
  return _.extend({}, file, {
    requires: requires = clean(file.requires),
    links: _.difference(clean(file.links), requires),
    globs: clean(file.globs)
  });
};
