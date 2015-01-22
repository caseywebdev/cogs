var _ = require('underscore');
var config = require('../../src/config');
var expect = require('chai').expect;
var glob = require('glob');
var getBuild = require('../../src/get-build');
var path = require('path');
var fs = require('fs');

var describe = global.describe;
var it = global.it;

describe('getBuild(filePath, cb)', function () {
  var configPaths = glob.sync('test/fixtures/*/config.json');

  _.each(configPaths, function (configPath) {
    var name = configPath.match(/test\/fixtures\/(.*?)\/config.json/)[1];
    var dir = path.dirname(configPath);
    var fileName = glob.sync(path.join(dir, 'a.*'))[0];
    var expected =
      fs.readFileSync(glob.sync(path.join(dir, 'expected.*'))[0], 'utf8');

    it(name, function (done) {
      config.set(require(path.resolve(configPath)));
      getBuild(fileName, function (er, build) {
        if (er) return done(er);
        expect(build.source).to.deep.equal(expected);
        done();
      });
    });
  });
});
