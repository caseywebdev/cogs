'use strict';

var _ = require('underscore');

module.exports = function (options) {
  this.options = _.extend({}, _.result(this, 'defaults'), options);
};
