const _ = require('underscore');
const walk = require('./walk');

module.exports = ({env, path}) =>
  walk({env, path}).then(files => Buffer.concat(_.map(files, 'buffer')));
