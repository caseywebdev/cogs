import npath from 'path';

const normalize = path => npath.normalize(path);

const clean = paths => new Set(paths.map(normalize));

export default file => {
  let { builds, links, requires } = file;
  requires = clean(requires);
  builds = clean(builds);
  links = clean(links);
  for (const path of requires) {
    builds.delete(path);
    links.delete(path);
  }
  for (const path of builds) links.delete(path);
  return Object.assign({}, file, {
    builds: [...builds],
    links: [...links],
    requires: [...requires]
  });
};
