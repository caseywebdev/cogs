var expect = require('chai').expect;
var getHash = require('../../src/get-hash');

var describe = global.describe;
var it = global.it;

describe('getHash(buffer)', function () {
  it('hashes a buffer', function () {
    expect(getHash('test')).to.equal('098f6bcd4621d373cade4e832627b4f6');
  });
});
