import npath from 'node:path';

import _ from 'underscore';

export default ({ file: { builds, links }, path }) =>
  _.contains(builds, path) ||
  _.any(links, link => npath.matchesGlob(path, link));
