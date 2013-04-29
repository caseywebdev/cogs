var _ = require('underscore');
var crypto = require('crypto');
var Engine = require('./engine');
var fs = require('fs');
var path = require('path');

module.exports = _.inherit(Engine, {
  defaults: {
    assetRoot: ''
  },

  process: function (asset, cb) {
    try {
      var stylus = require('stylus');
      var styl = stylus(asset.raw);
      styl.set('filename', asset.abs);
      if (this.options.fingerprintUrl) {
        var root = this.options.assetRoot;
        styl.define('url', function (str) {
          var val = str.val;
          try {
            var stripped = val.replace(/[?#].*/, '');
            var buffer = fs.readFileSync(path.join(root, stripped));
            var hash = crypto
              .createHash(asset.env.algorithm)
              .update(buffer)
              .digest('hex');
            var split = asset.env.split(val);
            var filename = split.base + '-' + hash + '.' + split.exts.join('.');
            str.val = path.join(path.dirname(val), filename);
          } catch (er) {}
          return new stylus.nodes.Literal('url(' + str + ')');
        });
      }
      if (this.options.compress) styl.set('compress', true);
      if (this.options.nib) {
        var nib = require('nib');
        styl.use(nib());
        if (this.options.importNib) styl.import('nib');
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
