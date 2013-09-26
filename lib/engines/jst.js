'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    namespace: 'jst'
  },

  process: function (asset, cb) {
    var self = this;
    asset.logical(function (er, logical) {
      if (er) return cb(er);

      // Wrap the asset in a `jst` namespace with the logical path as its key.
      var namespace = 'window.' + self.options.namespace;
      var orEq = '(' + namespace + ' || (' + namespace + ' = {}))';
      asset.raw = orEq + "['" + logical + "'] = " + asset.raw + ';\n';

      // Add the `.js` extension if it's not already there.
      if (asset.ext() !== 'js') asset.exts.push('js');

      cb();
    });
  }
});
