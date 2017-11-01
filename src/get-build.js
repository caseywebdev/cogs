const _ = require('underscore');
const walk = require('./walk');

module.exports = async ({env, path}) =>
  Buffer.concat(_.map(await walk({env, path}), 'buffer'));
