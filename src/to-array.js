const _ = require('underscore');

module.exports = val => val == null ? [] : _.isArray(val) ? val : [val];
