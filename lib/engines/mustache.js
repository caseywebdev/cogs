'use strict';

var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    type: 'jst',
    data: {},
    partials: {},
  },

  process: function (asset, cb) {
    try {
      var Mustache = require('mustache');
      var ext = asset.ext();
      var out = ext === 'jst' || ext === 'html' ? ext : this.options.type;
      asset.source =
        out === 'html' ?
        Mustache.render(
          asset.source,
          this.options.data,
          this.options.partials
        ) :
        'var source = ' + JSON.stringify(asset.source) + ';\n' +
        'var fn = function (data, partials) {\n' +
        '  return Mustache.render(source, data, partials);\n' +
        '};\n' +
        'fn.source = source;\n' +
        'return fn;\n';
      if (ext !== out) asset.exts.push(out);
      cb();
    } catch (er) {
      cb(er);
    }
  }
});
