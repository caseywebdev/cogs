var _ = require('underscore');

module.exports = function (options) {
  this.options = _.extend({}, this.defaults, options);
};
