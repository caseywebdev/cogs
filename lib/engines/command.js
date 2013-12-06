'use strict';

var Engine = require('./engine');
var exec = require('child_process').exec;
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: function () {
    return {
      arguments: [],
      stdin: true
    };
  },

  createChild: function () {
    var args = [this.options.command].concat(this.options.arguments);
    var child = exec(args.join(' '), function (er, stdout, stderr) {
      child.done = true;
      child.er = er || (stderr && new Error(stderr));
      child.source = stdout;
      if (child.cb) return child.cb(child.er, stdout);
    });
    return child;
  },

  process: function (asset, cb) {
    var child = this.createChild(asset);
    var ext = this.options.ext;
    child.cb = function (er, source) {
      if (er) return cb(er);
      asset.source = source;
      if (!asset.ext()) asset.exts.push(ext);
      cb();
    };
    if (child.done) return child.cb(child.er, child.source);
    child.stdin.end(this.options.stdin ? asset.source : null);
  }
});
