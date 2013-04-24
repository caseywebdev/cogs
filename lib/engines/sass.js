var _ = require('underscore');
var Engine = require('./engine');
var spawn = require('child_process').spawn;

module.exports = _.inherit(Engine, {
  defaults: {
    poolSize: 10
  },

  createPool: function (env) {
    var args = this.options.arguments || (this.options.arguments = []);
    _.each(env.paths, function (path) { args.push('-I', path); });
    this.pool = _.times(this.options.poolSize, function () {
      return spawn('sass', args);
    });
    env.on('end', _.bind(_.invoke, _, this.pool, 'kill'));
  },

  getSass: function () {
    this.pool.unshift(spawn('sass', this.options.arguments));
    return this.pool.pop();
  },

  process: function (asset, cb) {
    if (!this.pool) this.createPool(asset.env);
    var sass = this.getSass();
    var raw = '';
    var er = '';
    sass.stdout.on('data', function (data) { raw += data; });
    sass.stderr.on('data', function (data) { er += data; });
    sass.on('close', function () {
      if (er) return cb(new Error(er));
      asset.raw = raw;

      // Add the `.css` extension if it's not already there
      if (asset.ext() !== 'css') asset.exts.push('css');
      cb();
    });

    sass.stdin.write(asset.raw);
    sass.stdin.end();
  }
});
