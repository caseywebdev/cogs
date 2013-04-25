var _ = require('underscore');
var Engine = require('./engine');
var exec = require('child_process').exec;

module.exports = _.inherit(Engine, {
  defaults: function () {
    return {
      poolSize: 10,
      arguments: []
    };
  },

  createPool: function (env) {
    return _.times(this.options.poolSize, _.bind(this.createChild, this, env));
  },

  createChild: function (env) {
    var args = [this.options.command].concat(this.options.arguments);
    var child = exec(args.join(' '), function (er, stdout, stderr) {
      child.done = true;
      child.er = er || (stderr && new Error(stderr));
      child.raw = stdout;
      if (child.cb) return child.cb(child.er, stdout);
    });
    env.on('end', _.bind(child.kill, child));
    return child;
  },

  getChild: function (env) {
    if (!this.pool) this.pool = this.createPool(env);
    this.pool.unshift(this.createChild(env));
    return this.pool.pop();
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
