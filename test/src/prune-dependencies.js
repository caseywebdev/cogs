var expect = require('chai').expect;
var pruneDependencies = require('../../src/prune-dependencies');

var describe = global.describe;
var it = global.it;

describe('pruneDependencies(file)', function () {
  var file = {
    requires: ['a', 'a', 'a*'],
    links: ['a', 'b', 'b', 'c'],
    globs: ['a*', 'b', 'c', 'c']
  };

  it('uniques and favors requires then links and uniques globs', function () {
    expect(pruneDependencies(file)).to.deep.equal({
      requires: ['a', 'a*'],
      links: ['b', 'c'],
      globs: ['a*', 'b', 'c']
    });
  });
});
