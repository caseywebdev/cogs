var _ = require('underscore');
var Imagemin = require('imagemin');

module.exports = function (file, options, cb) {
  var plugin = Imagemin[options.plugin];
  if (!_.isFunction(plugin)) {
    return cb(new Error("Unknown Imagemin plugin '" + options.plugin + "'"));
  }
  (new Imagemin())
    .src(file.buffer)
    .use(plugin(options.pluginOptions))
    .run(function (er, files) {
      if (er) return cb(er);
      cb(null, {buffer: files[0].contents});
    });
};
