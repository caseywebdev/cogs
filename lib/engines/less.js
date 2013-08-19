'use strict';

var _ = require('underscore');
var Engine = require('./engine');

module.exports = _.inherit(Engine, {
  process: function (asset, cb) {
    try {
      var less = require('less');
      var parser = new less.Parser(_.extend({
        paths: asset.env.paths,
        filename: asset.path
      }, this.options));
      parser.parse(asset.raw, function (er, tree) {
        if (er) return cb(er);

        asset.raw = tree.toCSS();

        // Add the `.css` extension if it's not already there
        if (asset.ext() !== 'css') asset.exts.push('css');
        cb();
      });
    } catch (er) {
      cb(er);
    }
  }
});
