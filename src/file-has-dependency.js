const _ = require('underscore');
const minimatch = require('minimatch');

module.exports = ({file: {globs, links}, path}) =>
  _.contains(links, path) || _.any(globs, glob => minimatch(path, glob));
