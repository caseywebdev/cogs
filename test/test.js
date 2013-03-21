var _ = require('underscore');
var async = require('async');
var fs = require('fs');
require('chai').should();
var cogs = require('..');

var describe = global.describe;
var it = global.it;

describe('Env Setup', function () {
  it('should add new paths', function () {
    cogs.addPaths('test/cases');
  });

  it('should get the base of a filename with dots', function () {
    cogs.split('/a/b.html.jade.html.jade').base.should.equal('b.html.jade');
  });

  it('should get the extensions of a filename with dots', function () {
    cogs.split('/a/b.html.coffee.html.jade').exts.should.eql(['html', 'jade']);
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
        result[0].should.equal(result[1]);
        done();
      });
    });
  });
});
