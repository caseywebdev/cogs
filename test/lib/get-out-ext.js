var expect = require('chai').expect;
var getOutExt = require('../../lib/get-out-ext');

var describe = global.describe;
var it = global.it;

describe('getOutExt(ext, config)', function () {
  var config = {
    in: {
      es6: {
        out: 'foo'
      },
      foo: {
        out: 'js'
      }
    }
  };

  it('works for files without an extension', function () {
    expect(getOutExt('', config)).to.equal('');
  });

  it('works for file with one extension through one transform', function () {
    expect(getOutExt('foo', config)).to.equal('js');
  });

  it('works for file with one through two transforms extension', function () {
    expect(getOutExt('es6', config)).to.equal('js');
  });

  it('passes untransformed extensions through', function () {
    expect(getOutExt('png', config)).to.equal('png');
  });
});
