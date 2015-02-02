var _ = require('underscore');
var expect = require('chai').expect;
var memoize = require('../../src/memoize');

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

describe('memoize.bust(pattern, only)', function () {
  var fn = memoize(_.noop);
  var fn2 = memoize(_.noop);

  it('removes an exact key from the cache', function () {
    fn.cache.key = true;
    memoize.bust('key');
    expect(fn.cache.key).to.be.not.ok;
  });

  it('removes a glob pattern of keys from the cache', function () {
    fn.cache.key = true;
    memoize.bust('**/*');
    expect(fn.cache.key).to.be.not.ok;
  });

  it('removes keys only from the fns specified', function () {
    fn.cache.key = true;
    fn2.cache.key = true;
    memoize.bust('key', [fn2]);
    expect(fn.cache.key).to.be.ok;
    expect(fn2.cache.key).to.be.not.ok;
  });
});
