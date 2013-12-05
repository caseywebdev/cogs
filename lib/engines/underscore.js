'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    type: 'jst'
  },

  process: function (asset, cb) {
    try {
      var ext = asset.ext();
      var out = ext === 'jst' || ext === 'html' ? ext : this.options.type;
      var template = _.template(asset.source, null, this.options);
      asset.source = out === 'html' ? template() : template.source;
      if (ext !== out) asset.exts.push(out);
      cb();
    } catch (er) {
      cb(er);
    }
  }
});
