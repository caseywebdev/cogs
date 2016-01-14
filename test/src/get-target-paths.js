var expect = require('chai').expect;
var getTargetPaths = require('../../src/get-target-paths');

var describe = global.describe;
var it = global.it;

describe('getTargetPaths(file, sourceGlob, target)', function () {
  it('works for the simple case', function () {
    getTargetPaths(
      {path: 'src/file.es6'},
      'src/file.es6',
      'public/js/file.js',
      (er, targetPaths) =>
        expect(targetPaths).to.equal('public/js/file.js')
    );
  });

  it('works with **/* globs', function () {
    getTargetPaths(
      {path: 'src/a/b/c/file.es6'},
      'src/**/*',
      {dir: 'public/js', ext: {'.es6': '.js'}},
      (er, targetPaths) =>
        expect(targetPaths).to.equal('public/js/a/b/c/file.js')
    );
  });

  it('works with {} globs', function () {
    getTargetPaths(
      {path: 'src/a/b/c/file.es6'},
      'src/{a}/**/*',
      {dir: 'public/js', ext: {'.es6': '.js'}},
      (er, targetPaths) =>
        expect(targetPaths).to.equal('public/js/a/b/c/file.js')
    );
  });

  it('works with ?() extglob', function () {
    getTargetPaths(
      {path: 'src/a/b/c/Makefile', hash: '123abc'},
      'src/?(a)/**/*',
      {dir: 'public/', fingerprint: true},
      (er, targetPaths) =>
        expect(targetPaths).to.equal('public/a/b/c/Makefile-123abc')
    );
  });

  it('works with +() extglob', function () {
    getTargetPaths(
      {path: 'src/a/b/c/Makefile', hash: '123abc'},
      'src/+(a)/**/*',
      {dir: 'public/', fingerprint: true},
      (er, targetPaths) =>
        expect(targetPaths).to.equal('public/a/b/c/Makefile-123abc')
    );
  });

  it('works with @() extglob', function () {
    getTargetPaths(
      {path: 'src/a/b/c/Makefile', hash: '123abc'},
      'src/@(a)/**/*',
      {dir: 'public/', fingerprint: true},
      (er, targetPaths) =>
        expect(targetPaths).to.equal('public/a/b/c/Makefile-123abc')
    );
  });

  it('works with !() extglob', function () {
    getTargetPaths(
      {path: 'src/a/b/c/Makefile', hash: '123abc'},
      'src/!(a)/**/*',
      {dir: 'public/', fingerprint: true},
      (er, targetPaths) =>
        expect(targetPaths).to.equal('public/a/b/c/Makefile-123abc')
    );
  });

  it('fingerprints when appropriate', function () {
    getTargetPaths(
      {path: 'src/a/b/c/file.es6', hash: '123abc'},
      'src/{a}/**/*',
      {dir: 'public/js', ext: {'.es6': '.js'}, fingerprint: true},
      (er, targetPaths) =>
        expect(targetPaths).to.equal('public/js/a/b/c/file-123abc.js')
    );
  });

  it('fingerprints files without extensions', function () {
    getTargetPaths(
      {path: 'src/a/b/c/Makefile', hash: '123abc'},
      'src/{a}/**/*',
      {dir: 'public/', fingerprint: true},
      (er, targetPaths) =>
        expect(targetPaths).to.equal('public/a/b/c/Makefile-123abc')
    );
  });

  it('fails when the source and destination match', function () {
    getTargetPaths(
      {path: 'src/foo.js'},
      'src/foo.js',
      {dir: 'src'},
      er => expect(er).to.be.an.instanceOf(Error)
    );
  });
});
