const _ = require('underscore');

module.exports = val => {
  if (val == null) return [];

  if (_.isArray(val)) return val;

  return [val];
};
