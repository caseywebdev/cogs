'use strict';

var _ = require('underscore');
var Command = require('./command');
var herit = require('herit');

module.exports = herit(Command, {
  defaults: function () {
    return _.extend(_.result(Command.prototype, 'defaults'), {
      command: 'sass',
      ext: 'css'
    });
  },

  createChild: function (env) {
    if (!this.pathsAppended) {
      var args = this.options.arguments;
      _.each(env.paths, function (path) { args.push('-I', path); });
      this.pathsAppended = true;
    }
    return Command.prototype.createChild.apply(this, arguments);
  }
});
