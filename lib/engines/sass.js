'use strict';

var _ = require('underscore');
var Command = require('./command');
var herit = require('herit');
var path = require('path');

module.exports = herit(Command, {
  defaults: function () {
    return _.extend(_.result(Command.prototype, 'defaults'), {
      command: 'sass',
      ext: 'css'
    });
  },

  createChild: function (asset) {
    var args = this.options.arguments;
    args.push('--no-cache');
    _.each([path.dirname(asset.abs)].concat(asset.env.paths), function (path) {
      args.push('--load-path', path);
    });
    return Command.prototype.createChild.apply(this, arguments);
  }
});
