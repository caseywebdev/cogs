var expect = require('chai').expect;
var getTargetDir = require('../../lib/get-target-dir');
var path = require('path');

var describe = global.describe;
var it = global.it;

describe('getTargetDir(filePath, sourceGlob, targetDir)', function () {
  it('works for the simple case', function () {
    expect(
      getTargetDir(
        'lib/file.es6',
        'lib/file.es6',
        'public/js'
      )
    ).to.equal('public/js');
  });

  it('works with **/* globs', function () {
    expect(
      getTargetDir(
        'lib/a/b/c/file.es6',
        'lib/**/*',
        'public/js'
      )
    ).to.equal('public/js/a/b/c');
  });

  it('works with {} globs', function () {
    expect(
      getTargetDir(
        'lib/a/b/c/file.es6',
        'lib/{a}/**/*',
        'public/js'
      )
    ).to.equal('public/js/a/b/c');
  });
});
