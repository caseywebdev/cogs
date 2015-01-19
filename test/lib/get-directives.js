var expect = require('chai').expect;
var fs = require('fs');
var getDirectives = require('../../lib/get-directives');
var path = require('path');

var describe = global.describe;
var it = global.it;

describe('getDirectives(source)', function () {
  var source =
    fs.readFileSync(path.join(__dirname, '../fixtures/directives.txt'), 'utf8');
  var expected = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../fixtures/directives.json'), 'utf8')
  );

  it('correctly pulls directives', function () {
    expect(getDirectives(source)).to.deep.equal(expected);
  });
});
