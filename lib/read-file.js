var _ = require('underscore');
var fs = require('fs');
var memoize = require('./memoize');

module.exports = memoize(_.partial(fs.readFile, _, 'utf8'));
