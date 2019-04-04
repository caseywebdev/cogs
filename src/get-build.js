const _ = require('underscore');
const walk = require('./walk');

const getAllFiles = build =>
  _.reduce(
    build.files,
    (files, file) =>
      _.reduce(
        file.builds,
        (files, build) => _.extend({}, files, getAllFiles(build)),
        files
      ),
    build.files
  );

const resolve = async ({ env, path, seen = {} }) => {
  if (seen[path]) return;

  const build = (seen[path] = { path });
  const files = (build.files = _.indexBy(await walk({ env, path }), 'path'));
  const builds = (build.builds = _.compact(
    _.flatten(
      await Promise.all(
        _.map(files, file =>
          Promise.all(_.map(file.builds, path => resolve({ env, path, seen })))
        )
      )
    )
  ));

  const shared = {};
  _.each(builds, build =>
    _.each(getAllFiles(build), file =>
      shared[file.path] ? (files[file.path] = file) : (shared[file.path] = true)
    )
  );

  return build;
};

const dedupe = (build, included = {}) => {
  const { builds, files } = build;
  _.each(included, (__, path) => delete files[path]);
  _.each(builds, build => dedupe(build, { ...included, ...files }));
  return _.extend(build, { buffer: Buffer.concat(_.map(files, 'buffer')) });
};

module.exports = async ({ env, path }) => dedupe(await resolve({ env, path }));
