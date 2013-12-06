'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  process: function (asset, cb) {
    try {
      var less = require('less');
      var parser = new less.Parser(_.extend({
        paths: asset.env.paths,
        filename: asset.path
      }, this.options));
      parser.parse(asset.source, function (er, tree) {
        if (er) return cb(er);

        asset.source = tree.toCSS();

        // Add the `.css` extension if it's not already there
        if (!asset.ext()) asset.exts.push('css');
        cb();
      });
    } catch (er) {
      cb(er);
    }
  }
});
