var expect = require('chai').expect;
var getTargetPath = require('../../lib/get-target-path');

var describe = global.describe;
var it = global.it;

describe('getTargetPath(file, sourceGlob, target)', function () {
  var config = {
    in: {
      es6: {
        out: 'js'
      }
    }
  };

  it('works for the simple case', function () {
    expect(
      getTargetPath(
        {path: 'lib/file.es6'},
        'lib/file.es6',
        'public/js',
        config
      )
    ).to.equal('public/js/file.js');
  });

  it('works without a sourceGlob', function () {
    expect(
      getTargetPath(
        {path: 'lib/file.es6'},
        null,
        {dir: 'public/js'},
        config
      )
    ).to.equal('public/js/file.js');
  });

  it('works with **/* globs', function () {
    expect(
      getTargetPath(
        {path: 'lib/a/b/c/file.es6'},
        'lib/**/*',
        'public/js',
        config
      )
    ).to.equal('public/js/a/b/c/file.js');
  });

  it('works with {} globs', function () {
    expect(
      getTargetPath(
        {path: 'lib/a/b/c/file.es6'},
        'lib/{a}/**/*',
        'public/js',
        config
      )
    ).to.equal('public/js/a/b/c/file.js');
  });

  it('fingerprints when appropriate', function () {
    expect(
      getTargetPath(
        {path: 'lib/a/b/c/file.es6', hash: '123abc'},
        'lib/{a}/**/*',
        {dir: 'public/js', fingerprint: true},
        config
      )
    ).to.equal('public/js/a/b/c/file-123abc.js');
  });

  it('fingerprints files without extensions', function () {
    expect(
      getTargetPath(
        {path: 'lib/a/b/c/Makefile', hash: '123abc'},
        'lib/{a}/**/*',
        {dir: 'public/', fingerprint: true},
        config
      )
    ).to.equal('public/a/b/c/Makefile-123abc');
  });
});
