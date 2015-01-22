var config = require('./config');

module.exports = function (ext) {
  var info = config.get().in[ext];
  var outExt = info && info.out || ext;
  return outExt === ext ? ext : module.exports(outExt);
};
