var expect = require('chai').expect;
var getExt = require('../../src/get-ext');

var describe = global.describe;
var it = global.it;

describe('getExt(filePath)', function () {
  it('works for files without an extension', function () {
    expect(getExt('src/Makefile')).to.equal('');
  });

  it('works for files dotfiles', function () {
    expect(getExt('src/.gitignore')).to.equal('');
  });

  it('works for file with one extension', function () {
    expect(getExt('src/file.es6')).to.equal('es6');
  });

  it('works for files with two extensions', function () {
    expect(getExt('src/file.js.es6')).to.equal('es6');
  });
});
