'use strict';

var Engine = require('./engine');
var exec = require('child_process').exec;
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: function () {
    return {
      arguments: [],
      execOptions: {
        maxBuffer: 10 * 1024 * 1024
      },
      stdin: true
    };
  },

  createChild: function () {
    var args = [this.options.command].concat(this.options.arguments);
    var child = exec(
      args.join(' '),
      this.options.execOptions,
      function (er, stdout, stderr) {
        child.done = true;
        child.er = er || (stderr && new Error(stderr));
        child.source = stdout;
        if (child.cb) return child.cb(child.er, stdout);
      }
    );
    return child;
  },

  run: function (asset, from, to, cb) {
    var child = this.createChild(asset);
    var ext = this.options.ext;
    child.cb = function (er, source) {
      if (er) return cb(er);
      asset[to] = source;
      if (!asset.ext()) asset.exts.push(ext);
      cb();
    };
    if (child.done) return child.cb(child.er, child.source);
    child.stdin.end(this.options.stdin ? asset[from] : null);
  },

  process: function (asset, cb) {
    this.run(asset, 'source', 'source', cb);
  },

  compress: function (asset, cb) {
    this.run(asset, 'built', 'compressed', cb);
  }
});
