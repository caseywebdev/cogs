const _ = require('underscore');
const resolveDependencies = require('./resolve-dependencies');

module.exports = ({env, path}) =>
  resolveDependencies({env, path})
    .then(files => Buffer.concat(_.map(files, 'buffer')));
