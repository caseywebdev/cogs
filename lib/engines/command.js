var _ = require('underscore');
var Engine = require('./engine');
var exec = require('child_process').exec;

module.exports = _.inherit(Engine, {
  defaults: function () {
    return {
      arguments: []
    };
  },

  createChild: function (env) {
    var args = [this.options.command].concat(this.options.arguments);
    var child = exec(args.join(' '), function (er, stdout, stderr) {
      env.removeListener('end', child.listener);
      child.done = true;
      child.er = er || (stderr && new Error(stderr));
      child.raw = stdout;
      if (child.cb) return child.cb(child.er, stdout);
    });
    child.listener = _.bind(child.kill, child);
    env.once('end', child.listener);
    return child;
  },

  getChild: function (env) {
    if (!this.standBy) this.standBy = this.createChild(env);
    var child = this.standBy;
    this.standBy = this.createChild(env);
    return child;
  },

  process: function (asset, cb) {
    var child = this.getChild(asset.env);
    var ext = this.options.ext;
    child.cb = function (er, raw) {
      if (er) return cb(er);
      asset.raw = raw;
      if (asset.ext() !== ext) asset.exts.push(ext);
      cb();
    };
    if (child.done) return child.cb(child.er, child.raw);
    child.stdin.end(asset.raw);
  }
});
