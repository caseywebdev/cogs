const _ = require('underscore');
const resolveDependencies = require('./resolve-dependencies');

module.exports = ({env, path}) =>
  resolveDependencies({env, path}).then(({requires, links, globs}) => ({
    buffer: Buffer.concat(_.map(requires, 'buffer')),
    globs,
    links,
    path,
    requires: _.map(requires, 'path')
  }));
