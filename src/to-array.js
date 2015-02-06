var _ = require('underscore');

module.exports = function (val) {
  return _.isArray(val) ? val : val ? [val] : [];
};
