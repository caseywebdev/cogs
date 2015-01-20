var getOutExt = module.exports = function (ext, options) {
  var info = options.in && options.in[ext];
  var outExt = info && info.out || ext;
  return outExt === ext ? ext : getOutExt(outExt, options);
};
