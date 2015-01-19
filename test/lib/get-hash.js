var expect = require('chai').expect;
var getHash = require('../../lib/get-hash');

var describe = global.describe;
var it = global.it;

describe('getHash(buffer)', function () {
  it('hashes buffers', function () {
    expect(getHash(new Buffer('test')))
      .to.equal('098f6bcd4621d373cade4e832627b4f6');
  });
});
