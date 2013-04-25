var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var expect = require('chai').expect;
var cogs = require('..');

var describe = global.describe;
var it = global.it;
var before = global.before;

describe('Env Setup', function () {
  it('adds new paths', function () {
    cogs.addPaths('test/cases');
  });

  it('gets the base of a filename with dots', function () {
    expect(cogs.split('/a/b.html.jade.html.jade').base).to.equal('b.html.jade');
  });

  it('gets the extensions of a filename with dots', function () {
    expect(cogs.split('/a/b.html.coffee.html.jade').exts)
      .to.eql(['html', 'jade']);
  });
});

describe('Asset', function () {
  before(function (done) {
    var self = this;
    cogs.asset('coffee/a', function (er, asset) {
      if (er) return done(er);
      self.asset = asset;
      asset.build(function (er) {
        if (er) return done(er);
        var str = asset.toString();
        self.md5 = crypto.createHash('md5').update(str).digest('hex');
        self.sha1 = crypto.createHash('sha1').update(str).digest('hex');
        done();
      });
    });
  });

  it('can return a hex fingerprint', function () {
    expect(_.bind(this.asset.fingerprint, this.asset)).to.throw(Error);
    expect(this.asset.fingerprint('md5')).to.equal(this.md5);
    expect(this.asset.fingerprint('sha1')).to.equal(this.sha1);
  });

  it('can generate a fingerprinted filename', function () {
    expect(this.asset.filename('md5')).to.equal('a-' + this.md5 + '.js');
    expect(this.asset.filename('sha1')).to.equal('a-' + this.sha1 + '.js');
  });
});

describe('Expected/Actual Comparisons', function () {
  var dirs = fs.readdirSync(__dirname + '/cases');
  _.each(dirs, function (dir) {
    if (dir[0] === '.') return;
    it(dir, function (done) {
      async.map([
        {file: '/a', method: 'build', property: 'built'},
        {file: '/expected', method: 'update', property: 'raw'}
      ], function (obj, cb) {
        cogs.asset(dir + obj.file, function (er, asset) {
          if (er) return cb(er);
          asset[obj.method](function (er) {
            if (er) return cb(er);
            cb(null, asset[obj.property].trim().replace(/\n\s*/g, '\n'));
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
