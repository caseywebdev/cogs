var _ = require('underscore');
var expect = require('chai').expect;
var memoize = require('../../src/memoize');
var minimatch = require('minimatch');

var describe = global.describe;
var it = global.it;

describe('memoize(fn)', function () {
  var fn = memoize(function (filePath, obj, cb) {
    _.defer(_.partial(cb, null, obj));
  });

  var obj = {};

  it('queues subsequent calls and fires the result at once', function (done) {
    fn('key', obj, function (er, b) { expect(b).to.equal(obj); });
    fn('key', null, function (er, b) { expect(b).to.equal(obj); });
    fn('key', null, function (er, b) { expect(b).to.equal(obj); done(); });
  });

  it('fires subsequent calls synchronously', function () {
    var sync = false;
    fn('key', null, function (er, b) {
      expect(b).to.equal(obj);
      sync = true;
    });
    if (!sync) throw new Error('Call was not synchronous');
  });
});
