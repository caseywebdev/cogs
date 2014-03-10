var _ = require('underscore');
var async = require('async');
var cogs = require('..');
var crypto = require('crypto');
var expect = require('chai').expect;
var fs = require('fs');
var glob = require('glob');
var path = require('path');

var describe = global.describe;
var it = global.it;
var before = global.before;

var envs = [];

// Environment 1
var env = new cogs.Env({amd: {basePath: 'test/env-1'}});
env.processors.rwk.options.whitespace = true;
env.processors.rwk.options.plugins = [
  'rework-variant'
];
env.processors.jst.options.dependencies = {
  jade: 'jade',
  mustache: 'Mustache',
  underscore: '_'
};
env.processors.jst.options.anonymous = false;
env.processors.es6.options.anonymous = false;
envs.push(env);

// Environment 2
envs.push(new cogs.Env({
  amd: {
    basePath: 'test/env-2',
    concat: true,
    names: {
      'double-define': 'test/vendor/double-define.js',
      fib: 'test/env-2/amd/fib.coffee',
      memoize: 'test/vendor/memoize.es6',
      'good-name': 'test/vendor/rename.js',
      'good-name-2': 'test/vendor/rename-2.js'
    },
    shims: {
      fib: {
        global: 'Fib',
        dependencies: ['memoize']
      }
    }
  }
}));

describe('Env Setup', function () {
  it('gets the base of a filename with dots', function () {
    expect(cogs.split('/a/b.html.jade.html.jade').base).to.equal('b.html.jade');
    expect(cogs.split('/a/b.png').base).to.equal('b');
    expect(cogs.split('/a/b').base).to.equal('b');
  });

  it('gets the extensions of a filename with dots', function () {
    expect(cogs.split('/a/b.html.coffee.html.jade').exts)
      .to.eql(['html', 'jade']);
    expect(cogs.split('/a/b.png').exts).to.eql(['png']);
    expect(cogs.split('/a/b').exts).to.eql([]);
  });
});

describe('Asset', function () {
  before(function (done) {
    var self = this;
    this.asset =
      envs[0].asset(path.join('test', 'env-1', 'coffee-script', 'a.coffee'));
    this.asset.build(function (er) {
      if (er) return done(er);
      var str = self.asset.toString();
      self.md5 = crypto.createHash('md5').update(str).digest('hex');
      done();
    });
  });

  it('can return a hex fingerprint', function () {
    expect(this.asset.fingerprint()).to.equal(this.md5);
  });

  it('can generate a fingerprinted filename', function () {
    expect(this.asset.filename()).to.equal('a.js');
    expect(this.asset.filename(true)).to.equal('a-' + this.md5 + '.js');
  });

  it('throws errors after subsequent builds', function (done) {
    var asset = cogs.asset('test/broke/requirer.coffee');
    asset.build(function (er) {
      expect(er).to.be.an.instanceOf(Error);
      asset.build(function (er) {
        expect(er).to.be.an.instanceOf(Error);
        done();
      });
    });
  });
});

describe('Expected/Actual Comparisons', function () {
  _.each(envs, function (env, i) {
    describe('Environment ' + (i + 1), function () {
      var envDir = path.resolve('test', 'env-' + (i + 1));
      var dirs = fs.readdirSync(envDir);
      _.each(dirs, function (dir) {
        if (dir[0] === '.') return;
        it(dir, function (done) {
          var prefix = path.join(envDir, dir);
          async.map([{
            file: path.join(prefix, 'a.*'),
            method: 'build',
            property: 'built'
          }, {
            file: path.join(prefix, 'expected.*'),
            method: 'update',
            property: 'source'
          }], function (obj, cb) {
            glob(obj.file, function (er, files) {
              var asset = env.asset(files[0]);
              asset[obj.method](function (er) {
                if (er) return cb(er);
                cb(null, asset[obj.property].trim().replace(/\s*\n\s*/g, '\n'));
              });
            });
          }, function (er, results) {
            if (er) return done(er);
            expect(results[0]).to.equal(results[1]);
            done();
          });
        });
      });
    });
  });
});
