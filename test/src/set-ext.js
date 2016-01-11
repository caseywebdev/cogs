var expect = require('chai').expect;
var setExt = require('../../src/set-ext');

var describe = global.describe;
var it = global.it;

describe('setExt(filePath, ext)', function () {
  it('works for files without an extension', function () {
    expect(setExt('src/Makefile', '.foo')).to.equal('src/Makefile.foo');
  });

  it('works for files dotfiles', function () {
    expect(setExt('src/.gitignore', '.foo')).to.equal('src/.gitignore.foo');
  });

  it('works for file with one extension', function () {
    expect(setExt('src/file.es6', '.foo')).to.equal('src/file.foo');
  });

  it('can remove an extension', function () {
    expect(setExt('src/file.js.es6', '')).to.equal('src/file.js');
  });

  it('noops without a second arg', function () {
    expect(setExt('src/file.noop')).to.equal('src/file.noop');
  });
});
