const _ = require('underscore');
const minimatch = require('minimatch');

module.exports = ({file: {builds, globs, links}, path}) =>
  _.contains([].concat(builds, links), path) ||
  _.any(globs, glob => minimatch(path, glob));
