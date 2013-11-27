'use strict';

var _ = require('underscore');
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

  createChild: function (asset) {
    var args = [this.options.command].concat(this.options.arguments);
    var child = exec(args.join(' '), function (er, stdout, stderr) {
      asset.env.removeListener('end', child.listener);
      child.done = true;
      child.er = er || (stderr && new Error(stderr));
      child.raw = stdout;
      if (child.cb) return child.cb(child.er, stdout);
    });
    child.listener = _.bind(child.kill, child);
    asset.env.once('end', child.listener);
    return child;
  },

  process: function (asset, cb) {
    var child = this.createChild(asset);
    var ext = this.options.ext;
    child.cb = function (er, raw) {
      if (er) return cb(er);
      asset.raw = raw;
      if (asset.ext() !== ext) asset.exts.push(ext);
      cb();
    };
    if (child.done) return child.cb(child.er, child.raw);
    child.stdin.end(this.options.stdin ? asset.raw : null);
  }
});
