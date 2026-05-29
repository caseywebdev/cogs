import npath from 'node:path';

export default ({ file: { builds, links }, path }) =>
  builds.includes(path) || links.some(link => npath.matchesGlob(path, link));
