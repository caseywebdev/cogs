var config = require('../../src/config');
var expect = require('chai').expect;
var getTransformers = require('../../src/get-transformers');

var before = global.before;
var describe = global.describe;
var it = global.it;

var to5 = require('cogs-transformer-babel');
var to5Version = require('cogs-transformer-babel/package').version;
var concatAmd = require('cogs-transformer-concat-amd');
var concatAmdVersion = require('cogs-transformer-concat-amd/package').version;

describe('getTransformers(filePath, config)', function () {
  before(function () {
    config.set({
      in: {
        es6: {
          transformers: 'babel'
        },
        a: {
          out: 'b',
          transformers: ['babel']
        },
        b: {
          out: 'c',
          transformers: {
            name: 'babel',
            only: ['only.a'],
            options: {foo: 'bar'}
          }
        },
        c: {
          transformers: [{
            name: 'babel',
            options: {buz: 'baz'}
          }, {
            name: 'concat-amd',
            except: 'except.*',
            options: {foo: 'bar'}
          }]
        }
      }
    });
  });

  it('works with no transformers', function () {
    expect(getTransformers('file.png')).to.deep.equal([]);
  });

  it('works with one transformer', function () {
    expect(getTransformers('file.es6')).to.deep.equal([{
      name: 'babel',
      options: {},
      fn: to5,
      version: to5Version
    }]);
  });

  it('works with chained transformers', function () {
    expect(getTransformers('file.a')).to.deep.equal([{
      name: 'babel',
      options: {},
      fn: to5,
      version: to5Version
    }, {
      name: 'babel',
      options: {buz: 'baz'},
      fn: to5,
      version: to5Version
    }, {
      name: 'concat-amd',
      except: 'except.*',
      options: {foo: 'bar'},
      fn: concatAmd,
      version: concatAmdVersion
    }]);
  });

  it('respects `only` arrays', function () {
    expect(getTransformers('only.a')).to.deep.equal([{
      name: 'babel',
      options: {},
      fn: to5,
      version: to5Version
    }, {
      name: 'babel',
      only: ['only.a'],
      options: {foo: 'bar'},
      fn: to5,
      version: to5Version
    }, {
      name: 'babel',
      options: {buz: 'baz'},
      fn: to5,
      version: to5Version
    }, {
      name: 'concat-amd',
      except: 'except.*',
      options: {foo: 'bar'},
      fn: concatAmd,
      version: concatAmdVersion
    }]);
  });

  it('respects `except` arrays', function () {
    expect(getTransformers('except.a')).to.deep.equal([{
      name: 'babel',
      options: {},
      fn: to5,
      version: to5Version
    }, {
      name: 'babel',
      options: {buz: 'baz'},
      fn: to5,
      version: to5Version
    }]);
  });
});
