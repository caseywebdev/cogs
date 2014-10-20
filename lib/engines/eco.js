'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    type: 'jst'
  },

  run: function (asset, cb) {
    try {
      var eco = require('eco');
      var ext = asset.ext();
      var out = ext === 'jst' || ext === 'html' ? ext : this.options.type;
      var html = out === 'html';
      asset.source =
        html ?
        eco.render(asset.source) :
        'return ' + eco.precompile(asset.source);
      if (ext !== out) asset.exts.push(out);
    } catch (er) { return cb(er); }
    cb();
  }
});
