var expect = require('chai').expect;
var pruneDependencies = require('../../src/prune-dependencies');

var describe = global.describe;
var it = global.it;

describe('pruneDependencies(file)', function () {
  var file = {
    requires: [{path: 'a', hash: 1}],
    links: [{path: 'a', hash: 2}, {path: 'b', hash: 1}],
    globs: [
      {path: 'a', hash: 3},
      {path: 'b', hash: 2},
      {path: 'c', hash: 1},
      {path: 'c', hash: 2}
    ]
  };

  it('uniques and favors requires, links then globs', function () {
    expect(pruneDependencies(file)).to.deep.equal({
      requires: [{path: 'a', hash: 1}],
      links: [{path: 'b', hash: 1}],
      globs: [{path: 'c', hash: 1}]
    });
  });
});
