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

cogs.processors.rwk.options.whitespace = true;
cogs.processors.rwk.options.plugins = [
  'rework-variant'
];
cogs.processors.es6.options.basePath = 'test/cases/es6-module-transpiler';
cogs.processors.jst.options.dependencies = [
  {module: 'jade', variable: 'jade'},
  {module: 'mustache', variable: 'Mustache'},
  {module: 'underscore', variable: '_'}
];

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
      cogs.asset(path.join('test', 'cases', 'coffee-script', 'a.coffee'));
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
});

describe('Expected/Actual Comparisons', function () {
  var dirs = fs.readdirSync(path.resolve('test', 'cases'));
  _.each(dirs, function (dir) {
    if (dir[0] === '.') return;
    it(dir, function (done) {
      var prefix = 'test/cases/' + dir;
      async.map([
        {file: prefix + '/a.*', method: 'build', property: 'built'},
        {file: prefix + '/expected.*', method: 'update', property: 'source'}
      ], function (obj, cb) {
        glob(obj.file, function (er, files) {
          var asset = cogs.asset(files[0]);
          asset[obj.method](function (er) {
            if (er) return cb(er);
            cb(null, asset[obj.property].trim().replace(/\s*\n\s*/g, '\n'));
          });
        });
      }, function (er, result) {
        if (er) return done(er);
        expect(result[0]).to.equal(result[1]);
        done();
      });
    });
  });
});
