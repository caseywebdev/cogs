const fs = require('fs');
const Promise = require('better-promise').default;

module.exports = Promise.promisify(fs.readFile);
