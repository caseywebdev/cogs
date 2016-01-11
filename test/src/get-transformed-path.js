var config = require('../../src/config');
var expect = require('chai').expect;
var getTransformedPath = require('../../src/get-transformed-path');

var before = global.before;
var describe = global.describe;
var it = global.it;

describe('getTransformedPath(filePath)', function () {
  before(function () {
    config.set({
      pipe: [
        {
          only: '**/*.es6',
          ext: '.foo'
        },
        {
          only: '**/*.foo',
          ext: '.js'
        }
      ]
    });
  });

  it('works for files without an extension', function () {
    expect(getTransformedPath('Makefile')).to.equal('Makefile');
  });

  it('works for file with one extension through one transform', function () {
    expect(getTransformedPath('some/file.foo')).to.equal('some/file.js');
  });

  it('works for file with one through two transforms extension', function () {
    expect(getTransformedPath('some/file.es6')).to.equal('some/file.js');
  });

  it('passes untransformed extensions through', function () {
    expect(getTransformedPath('another.png')).to.equal('another.png');
  });
});
