var config = require('../../src/config');
var expect = require('chai').expect;
var getTargetPath = require('../../src/get-target-path');

var before = global.before;
var describe = global.describe;
var it = global.it;

describe('getTargetPath(file, sourceGlob, target)', function () {
  before(function () {
    config.set({
      pipe: [
        {
          only: '**/*.es6',
          ext: '.js'
        }
      ]
    });
  });

  it('works for the simple case', function () {
    expect(
      getTargetPath(
        {path: 'src/file.es6'},
        'src/file.es6',
        'public/js'
      )
    ).to.equal('public/js/file.js');
  });

  it('works without a sourceGlob', function () {
    expect(
      getTargetPath(
        {path: 'src/file.es6'},
        null,
        {dir: 'public/js'}
      )
    ).to.equal('public/js/file.js');
  });

  it('works with **/* globs', function () {
    expect(
      getTargetPath(
        {path: 'src/a/b/c/file.es6'},
        'src/**/*',
        'public/js'
      )
    ).to.equal('public/js/a/b/c/file.js');
  });

  it('works with {} globs', function () {
    expect(
      getTargetPath(
        {path: 'src/a/b/c/file.es6'},
        'src/{a}/**/*',
        'public/js'
      )
    ).to.equal('public/js/a/b/c/file.js');
  });

  it('works with ?() extglob', function () {
    expect(
      getTargetPath(
        {path: 'src/a/b/c/Makefile', hash: '123abc'},
        'src/?(a)/**/*',
        {dir: 'public/', fingerprint: true}
      )
    ).to.equal('public/a/b/c/Makefile-123abc');
  });

  it('works with +() extglob', function () {
    expect(
      getTargetPath(
        {path: 'src/a/b/c/Makefile', hash: '123abc'},
        'src/+(a)/**/*',
        {dir: 'public/', fingerprint: true}
      )
    ).to.equal('public/a/b/c/Makefile-123abc');
  });

  it('works with @() extglob', function () {
    expect(
      getTargetPath(
        {path: 'src/a/b/c/Makefile', hash: '123abc'},
        'src/@(a)/**/*',
        {dir: 'public/', fingerprint: true}
      )
    ).to.equal('public/a/b/c/Makefile-123abc');
  });

  it('works with !() extglob', function () {
    expect(
      getTargetPath(
        {path: 'src/a/b/c/Makefile', hash: '123abc'},
        'src/!(a)/**/*',
        {dir: 'public/', fingerprint: true}
      )
    ).to.equal('public/a/b/c/Makefile-123abc');
  });

  it('fingerprints when appropriate', function () {
    expect(
      getTargetPath(
        {path: 'src/a/b/c/file.es6', hash: '123abc'},
        'src/{a}/**/*',
        {dir: 'public/js', fingerprint: true}
      )
    ).to.equal('public/js/a/b/c/file-123abc.js');
  });

  it('fingerprints files without extensions', function () {
    expect(
      getTargetPath(
        {path: 'src/a/b/c/Makefile', hash: '123abc'},
        'src/{a}/**/*',
        {dir: 'public/', fingerprint: true}
      )
    ).to.equal('public/a/b/c/Makefile-123abc');
  });
});
