var path = require('path');

module.exports = function (filePath) {
  return path.extname(filePath).slice(1);
};
