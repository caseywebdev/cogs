'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    type: 'jst',
    compileDebug: false
  },

  process: function (asset, cb) {
    try {
      var jade = require('jade');
      var ext = asset.ext();
      var options = this.options;
      var out = ext === 'jst' || ext === 'html' ? ext : options.type;
      var html = out === 'html';
      options = _.extend({filename: asset.abs}, options);
      asset.source =
        html ?
        jade.compile(asset.source, options)(options) :
        jade.compileClient(asset.source, options);
      if (out !== ext) asset.exts.push(out);
      cb();
    } catch (er) {
      cb(er);
    }
  }
});
