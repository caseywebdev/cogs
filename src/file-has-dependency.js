const _ = require('underscore');
const minimatch = require('minimatch');

module.exports = ({ file: { builds, links }, path }) =>
  _.contains(builds, path) || _.any(links, link => minimatch(path, link));
