'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: function () {
    return {
      whitespace: false,
      mixins: [],
      plugins: []
    };
  },

  process: function (asset, cb) {
    try {
      if (this.options.whitespace) {
        asset.raw = require('css-whitespace')(asset.raw);
      }

      var rework = require('rework');
      var rwk = rework(asset.raw);

      // Apply mixins
      _.each(this.options.mixins, function (mixin) {
        rwk.use(rework.mixin(require(mixin)));
      });

      // Apply rework plugins
      _.each(this.options.plugins, function (plugin) {
        var name = _.isArray(plugin) ? _.first(plugin) : plugin;
        var args = _.isArray(plugin) ? _.rest(plugin) : [];

        // If name starts with /, treat is as a built in rework plugin.
        if (name.indexOf('/') === 0) {
          return rwk.use(rework[name.slice(1)].apply(rework, args));
        }

        // Otherwise, treat it as a third-party plugin to be required.
        var thirdParty = require(name);
        rwk.use(thirdParty.apply(thirdParty, args));
      });

      // Compile
      asset.raw = rwk.toString();

      // Add the `.css` extension if it's not already there
      if (asset.ext() !== 'css') asset.exts.push('css');
      cb();
    } catch (er) {
      cb(er);
    }
  }
});
