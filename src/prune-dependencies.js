const _ = require('underscore');
const npath = require('npath');

const normalize = path => npath.normalize(path);

const clean = paths => _.unique(_.map(paths, normalize));

module.exports = file => {
  let {builds, links, requires} = file;
  requires = clean(requires);
  builds = _.difference(clean(builds), requires);
  links = _.difference(clean(links), [].concat(builds, requires));
  return _.extend({}, file, {builds, links, requires});
};
