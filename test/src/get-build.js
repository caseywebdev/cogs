var _ = require('underscore');
var config = require('../../src/config');
var expect = require('chai').expect;
var glob = require('glob');
var getBuild = require('../../src/get-build');
var path = require('path');
var fs = require('fs');

var beforeEach = global.beforeEach;
var describe = global.describe;
var it = global.it;

describe('getBuild(filePath, cb)', function () {
  var configPaths = glob.sync('test/fixtures/*/config.json');

  _.each(configPaths, function (configPath) {
    var name = configPath.match(/test\/fixtures\/(.*?)\/config.json/)[1];
    var dir = path.dirname(configPath);
    var fileName = glob.sync(path.join(dir, 'a.*'))[0];
    var invalidFileNames = glob.sync(path.join(dir, 'invalid.*'));
    var expected = fs.readFileSync(glob.sync(path.join(dir, 'expected.*'))[0]);

    describe(name, function () {
      beforeEach(function () {
        config.set(require(path.resolve(configPath)));
      });

      it('transforms when valid', function (done) {
        getBuild(fileName, function (er, build) {
          if (er) return done(er);
          expect(build.buffer).to.deep.equal(expected);
          done();
        });
      });

      _.each(invalidFileNames, function (invalidFileName) {
        it('fails when invalid', function (done) {
          getBuild(invalidFileName, function (er) {
            expect(er).to.be.an.instanceOf(Error);
            done();
          });
        });
      });
    });
  });
});
