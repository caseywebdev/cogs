var expect = require('chai').expect;
var getTargetPath = require('../../lib/get-target-path');

var describe = global.describe;
var it = global.it;

describe('getTargetPath(filePath, sourceGlob, targetDir)', function () {
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
        'lib/file.es6',
        'lib/file.es6',
        'public/js',
        config
      )
    ).to.equal('public/js/file.js');
  });

  it('works without a sourceGlob', function () {
    expect(
      getTargetPath(
        'lib/file.es6',
        null,
        'public/js',
        config
      )
    ).to.equal('public/js/file.js');
  });

  it('works with **/* globs', function () {
    expect(
      getTargetPath(
        'lib/a/b/c/file.es6',
        'lib/**/*',
        'public/js',
        config
      )
    ).to.equal('public/js/a/b/c/file.js');
  });

  it('works with {} globs', function () {
    expect(
      getTargetPath(
        'lib/a/b/c/file.es6',
        'lib/{a}/**/*',
        'public/js',
        config
      )
    ).to.equal('public/js/a/b/c/file.js');
  });
});
