'use strict';

var _ = require('underscore');
var Engine = require('./engine');

module.exports = _.inherit(Engine, {
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
