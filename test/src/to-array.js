var expect = require('chai').expect;
var toArray = require('../../src/to-array');

var describe = global.describe;
var it = global.it;

describe('toArray(val)', function () {
  it('passes arrays through', function () {
    var arr = [1, 2, 3];
    expect(toArray(arr)).to.equal(arr);
  });

  it('wraps strings', function () {
    expect(toArray('foo')).to.deep.equal(['foo']);
  });

  it('wraps objects', function () {
    expect(toArray({foo: 'bar'})).to.deep.equal([{foo: 'bar'}]);
  });

  it('converts falsey to empty array', function () {
    expect(toArray(null)).to.deep.equal([]);
  });
});
