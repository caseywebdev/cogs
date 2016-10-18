const _ = require('underscore');
const resolveDependencies = require('./resolve-dependencies');

module.exports = ({env, path}) => {
  const startedAt = _.now();
  return resolveDependencies({env, path}).then(({requires, links, globs}) => ({
    buffer: Buffer.concat(_.map(requires, 'buffer')),
    endedAt: _.now(),
    globs,
    links,
    path,
    requires: _.map(requires, 'path'),
    startedAt
  }));
};
