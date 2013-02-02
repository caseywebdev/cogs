var _ = require('underscore');
var Engine = require('./engine');

module.exports = _.inherit(Engine, {
  process: function (asset, cb) {
    try {
      var stylus = require('stylus');
      var styl = stylus(asset.raw);
      styl.set('filename', asset.abs);
      if (this.options.compress) styl.set('compress', true);
      if (this.options.nib) {
        var nib = require('nib');
        styl.use(nib());
        if (this.options.importNib) styl['import']('nib');
      }

      styl.render(function (er, css) {
        if (er) return cb(er);

        asset.raw = css;

        // Add the `.css` extension if it's not already there
        if (asset.ext() !== 'css') asset.exts.push('css');
        cb();
      });
    } catch (er) {
      cb(er);
    }
  }
});
