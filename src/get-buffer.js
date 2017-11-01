const {promisify} = require('util');
const fs = require('fs');

module.exports = promisify(fs.readFile);
