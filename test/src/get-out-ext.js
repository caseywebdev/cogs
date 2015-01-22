var config = require('../../src/config');
var expect = require('chai').expect;
var getOutExt = require('../../src/get-out-ext');

var before = global.before;
var describe = global.describe;
var it = global.it;

describe('getOutExt(ext)', function () {
  before(function () {
    config.set({
      in: {
        es6: {
          out: 'foo'
        },
        foo: {
          out: 'js'
        }
      }
    });
  });

  it('works for files without an extension', function () {
    expect(getOutExt('')).to.equal('');
  });

  it('works for file with one extension through one transform', function () {
    expect(getOutExt('foo')).to.equal('js');
  });

  it('works for file with one through two transforms extension', function () {
    expect(getOutExt('es6')).to.equal('js');
  });

  it('passes untransformed extensions through', function () {
    expect(getOutExt('png')).to.equal('png');
  });
});
