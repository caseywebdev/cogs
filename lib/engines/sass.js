var _ = require('underscore');
var CommandPool = require('./command-pool');

module.exports = _.inherit(CommandPool, {
  defaults: function () {
    return _.extend(_.result(CommandPool.prototype, 'defaults'), {
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
    return CommandPool.prototype.createChild.apply(this, arguments);
  }
});
