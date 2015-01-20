var getOutExt = module.exports = function (ext, config) {
  var info = config.in && config.in[ext];
  var outExt = info && info.out || ext;
  return outExt === ext ? ext : getOutExt(outExt, config);
};
