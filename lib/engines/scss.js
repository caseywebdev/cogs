var _ = require('underscore');
var Engine = require('./engine');

module.exports = _.inherit(Engine, {
  process: function (asset, cb) {
    try {
      require('node-sass').render(asset.raw, function (er, css) {
        if (er) return cb(er instanceof Error ? er : new Error(er));

        asset.raw = css;

        // Add the `.css` extension if it's not already there
        if (asset.ext() !== 'css') asset.exts.push('css');
        cb();
      }, _.extend({includePaths: asset.env.paths}, this.options));
    } catch (er) {
      cb(er);
    }
  }
});
