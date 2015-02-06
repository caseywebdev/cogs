var expect = require('chai').expect;
var pruneDependencies = require('../../src/prune-dependencies');

var describe = global.describe;
var it = global.it;

describe('pruneDependencies(file)', function () {
  var file = {
    requires: ['a'],
    links: ['a', 'b'],
    globs: ['a', 'b', 'c', 'c']
  };

  it('uniques and favors requires, links then globs', function () {
    expect(pruneDependencies(file)).to.deep.equal({
      requires: ['a'],
      links: ['b'],
      globs: ['c']
    });
  });
});
