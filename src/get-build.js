const _ = require('underscore');
const crypto = require('crypto');
const walk = require('./walk');

const getAllFiles = build =>
  _.reduce(build.files, (files, file) =>
    _.reduce(file.builds, (files, build) =>
      _.extend({}, files, getAllFiles(build))
    )
  , build.files);

const resolve = async ({env, path, seen = {}}) => {
  if (seen[path]) return;

  const build = seen[path] = {};
  const files = _.indexBy(await walk({env, path}), 'path');
  const shared = {};
  const builds = [];
  await Promise.all(_.map(files, file =>
    Promise.all(_.map(file.builds, async path => {
      const build = await resolve({env, path, seen});
      if (!build) return;

      builds.push(build);
      _.each(getAllFiles(build), file =>
        shared[file.path] ?
        files[file.path] = file :
        shared[file.path] = true
      );
    }))
  ));

  return _.extend(build, {builds, files, path});
};

const getHash = buffer => {
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
};

const dedupe = (build, included = {}) => {
  const {builds, files, path} = build;
  _.each(included, (__, path) => delete files[path]);
  _.each(builds, build => dedupe(build, {...included, ...files}));
  const buffer = Buffer.concat(_.map(files, 'buffer'));
  const hash = getHash(buffer);
  return _.extend(build, {buffer, hash, path});
};

module.exports = async ({env, path}) => dedupe(await resolve({env, path}));
