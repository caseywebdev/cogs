var fs = require('fs');
var memoize = require('./memoize');

module.exports = memoize(fs.readFile);
