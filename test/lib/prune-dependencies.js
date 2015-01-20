var expect = require('chai').expect;
var pruneDependencies = require('../../lib/prune-dependencies');

var describe = global.describe;
var it = global.it;

describe('pruneDependencies(file)', function () {
  var file = {
    includes: ['a'],
    links: ['a', 'b'],
    globs: ['a', 'b', 'c']
  };

  it('favors includes over links and links over globs', function () {
    expect(pruneDependencies(file)).to.deep.equal({
      includes: ['a'],
      links: ['b'],
      globs: ['c']
    });
  });
});
