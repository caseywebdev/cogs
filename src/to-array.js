const _ = require('underscore');

module.exports = val => _.isArray(val) ? val : val ? [val] : [];
