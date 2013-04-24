var _ = require('underscore');
var Engine = require('./engine');
var exec = require('child_process').exec;

module.exports = _.inherit(Engine, {
  defaults: {
    arguments: []
  },

  process: function (asset, cb) {
    var args = this.options.arguments.slice();
    _.each(asset.env.paths, function (path) { args.push('-I', path); });
    exec('sass ' + args.join(' '), function (er, stdout, stderr) {
      if (er || (er = (stderr && new Error(stderr)))) return cb(er);
      asset.raw = stdout;
      if (asset.ext() !== 'css') asset.exts.push('css');
      cb();
    }).stdin.end(asset.raw);
  }
});
