var expect = require('chai').expect;
var getTransformers = require('../../lib/get-transformers');

var describe = global.describe;
var it = global.it;

describe('getTransformers(ext, config)', function () {
  var config = {
    in: {
      es6: {
        transformers: '6to5'
      },
      a: {
        out: 'b',
        transformers: ['6to5']
      },
      b: {
        out: 'c',
        transformers: {
          name: '6to5',
          options: {foo: 'bar'}
        }
      },
      c: {
        transformers: [{
          name: '6to5',
          options: {buzz: 'baz'}
        }, {
          name: 'concat-amd',
          options: {foo: 'bar'}
        }]
      }
    }
  };

  it('works with no transformers', function () {
    expect(getTransformers('png', config)).to.deep.equal([]);
  });

  it('works with one transformer', function () {
    expect(getTransformers('es6', config)).to.deep.equal([{
      name: '6to5',
      options: {}
    }]);
  });

  it('works with chained transformers', function () {
    expect(getTransformers('a', config)).to.deep.equal([{
      name: '6to5',
      options: {}
    }, {
      name: '6to5',
      options: {foo: 'bar'}
    }, {
      name: '6to5',
      options: {buzz: 'baz'}
    }, {
      name: 'concat-amd',
      options: {foo: 'bar'}
    }]);
  });
});
