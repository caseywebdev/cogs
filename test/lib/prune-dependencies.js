var expect = require('chai').expect;
var pruneDependencies = require('../../lib/prune-dependencies');

var describe = global.describe;
var it = global.it;

describe('pruneDependencies(file)', function () {
  var file = {
    includes: [['a', 1]],
    links: [['a', 2], ['b', 1]],
    globs: [['a', 3], ['b', 2], ['c', 1], ['c', 2]]
  };

  it('uniques and favors includes, links then globs', function () {
    expect(pruneDependencies(file)).to.deep.equal({
      includes: [['a', 1]],
      links: [['b', 1]],
      globs: [['c', 1]]
    });
  });
});
