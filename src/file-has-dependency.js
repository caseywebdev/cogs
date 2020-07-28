import minimatch from 'minimatch';
import _ from 'underscore';

export default ({ file: { builds, links }, path }) =>
  _.contains(builds, path) || _.any(links, link => minimatch(path, link));
