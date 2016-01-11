var path = require('path');

module.exports = function (filePath, ext) {
  if (ext == null) return filePath;
  var prev = path.extname(filePath);
  if (prev) filePath = filePath.slice(0, -prev.length);
  return filePath + ext;
};
