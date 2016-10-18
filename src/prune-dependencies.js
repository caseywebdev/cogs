const _ = require('underscore');
const npath = require('npath');

const normalize = path => npath.normalize(path);

const clean = paths => _.unique(_.map(paths, normalize));

module.exports = file => {
  let {requires, links, globs} = file;
  requires = clean(requires);
  links = _.difference(clean(links), requires);
  globs = clean(globs);
  return _.extend({}, file, {requires, links, globs});
};
