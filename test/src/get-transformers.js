var config = require('../../src/config');
var expect = require('chai').expect;
var getTransformers = require('../../src/get-transformers');

var before = global.before;
var describe = global.describe;
var it = global.it;

var foo = require('../transformers/foo');
var fooVersion = require('../transformers/foo/package').version;
var bar = require('../transformers/bar');
var barVersion = require('../transformers/bar/package').version;

describe('getTransformers(filePath, config)', function () {
  before(function () {
    config.set({
      pipe: [
        {
          name: './test/transformers/foo',
          only: '**/*.es6'
        },
        {
          name: './test/transformers/foo',
          only: ['only.a'],
          ext: '.c',
          options: {foo: 'bar'}
        },
        {
          name: './test/transformers/foo',
          only: '**/*.a',
          ext: '.b'
        },
        {
          name: './test/transformers/foo',
          only: '**/*.c',
          options: {buz: 'baz'}
        },
        {
          name: './test/transformers/bar',
          only: '**/*.c',
          except: 'except.*',
          options: {foo: 'bar'}
        }
      ]
    });
  });

  it('works with no transformers', function () {
    expect(getTransformers('file.png')).to.deep.equal([]);
  });

  it('works with one transformer', function () {
    expect(getTransformers('file.es6')).to.deep.equal([{
      name: './test/transformers/foo',
      only: '**/*.es6',
      options: {},
      fn: foo,
      version: fooVersion
    }]);
  });

  it('works with chained transformers', function () {
    expect(getTransformers('file.a')).to.deep.equal([{
      name: './test/transformers/foo',
      only: '**/*.a',
      ext: '.b',
      options: {},
      fn: foo,
      version: fooVersion
    }]);
  });

  it('respects `only` arrays', function () {
    expect(getTransformers('file.a')).to.deep.equal([{
      name: './test/transformers/foo',
      only: ['only.a'],
      ext: '.c',
      options: {},
      fn: foo,
      version: fooVersion
    }, {
      name: './test/transformers/foo',
      only: '**/*.c',
      options: {buz: 'baz'},
      fn: foo,
      version: fooVersion
    }, {
      name: './test/transformers/bar',
      only: '**/*.c',
      except: 'except.*',
      options: {foo: 'bar'},
      fn: bar,
      version: barVersion
    }]);
  });

  it('respects `except` arrays', function () {
    expect(getTransformers('except.a')).to.deep.equal([{
      name: './test/transformers/foo',
      options: {},
      fn: foo,
      version: fooVersion
    }, {
      name: './test/transformers/foo',
      options: {buz: 'baz'},
      fn: foo,
      version: fooVersion
    }]);
  });
});
