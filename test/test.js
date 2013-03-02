var _ = require('underscore');
var fs = require('fs');
require('chai').should();
var xl8 = require('..');

var describe = global.describe;
var it = global.it;

describe('Env Setup', function () {
  it('should add new paths', function () {
    xl8.addPaths('test/cases');
  });

  it('should get the base of a filename with dots', function () {
    xl8.split('/a/b.html.c.html.jade').base.should.equal('b.html.c');
  });

  it('should get the extensions of a filename with dots', function () {
    xl8.split('/a/b.html.c.html.jade').exts.should.eql(['html', 'jade']);
  });
});

describe('Expected/Result Comparisons', function () {
  var dirs = fs.readdirSync(__dirname + '/cases');
  _.each(dirs, function (dir) {
    if (dir[0] === '.') return;
    it(dir, function (done) {
      var expected;
      var result;
      var compare = _.after(2, function () {
        result.should.equal(expected);
        done();
      });
      xl8.asset(dir + '/expected', function (er, asset) {
        if (er) return done(er);
        asset.update(function (er) {
          if (er) return done(er);
          expected = asset.raw.trim();
          compare();
        });
      });
      xl8.asset(dir + '/a', function (er, asset) {
        if (er) return done(er);
        asset.build(function (er) {
          if (er) return done(er);
          result = asset.built.trim();
          compare();
        });
      });
    });
  });
});
