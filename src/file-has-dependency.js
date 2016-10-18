const _ = require('underscore');
const minimatch = require('minimatch');

module.exports = ({file, path}) => {
  const paths = file.requires.concat(file.links);
  const globs = file.globs;
  return _.contains(paths, path) || _.any(globs, glob => minimatch(path, glob));
};
