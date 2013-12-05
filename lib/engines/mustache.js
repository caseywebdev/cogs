'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    type: 'jst'
  },

  process: function (asset, cb) {
    try {
      var Mustache = require('mustache');
      var ext = asset.ext();
      var out = ext === 'jst' || ext === 'html' ? ext : this.options.type;
      asset.raw =
        out === 'html' ?
        Mustache.render(asset.raw) :
        'function (data) { return Handlebars.render(' + JSON.stringify(
          Mustache.parse(asset.raw)
        ) + ', data); }';
      if (ext !== out) asset.exts.push(out);
      cb();
    } catch (er) {
      cb(er);
    }
  }
});
