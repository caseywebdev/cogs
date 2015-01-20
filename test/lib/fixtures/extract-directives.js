var expect = require('chai').expect;
var fs = require('fs');
var extractDirectives = require('../../../lib/transformers/extract-directives');
var path = require('path');

var before = global.before;
var describe = global.describe;
var it = global.it;

describe('extractDirectives(file, config, cb)', function () {
  var inPath = 'test/fixtures/lib/transformers/extract-directives/in';
  var outPath = 'test/fixtures/lib/transformers/extract-directives/out';
  var inBuffer = fs.readFileSync(inPath);
  var outBuffer = fs.readFileSync(outPath);

  before(function (done) {
    var self = this;
    extractDirectives({
      path: path.relative('.', inPath),
      buffer: inBuffer,
      includes: ['dummy'],
      links: [],
      globs: []
    }, {}, function (er, file) {
      if (er) return done(er);
      self.file = file;
      done();
    });
  });

  it('extracts the directive lines', function () {
    expect(this.file.buffer.toString()).to.equal(outBuffer.toString());
  });

  it('prepends includes', function () {
    expect(this.file.includes).to.deep.equal([
      'test/fixtures/lib/transformers/extract-directives/in',
      'test/fixtures/lib/transformers/extract-directives/deps/a',
      'test/fixtures/lib/transformers/extract-directives/deps/b',
      'dummy'
    ]);
  });

  it('prepends links', function () {
    expect(this.file.links).to.deep.equal([
      'package.json'
    ]);
  });

  it('prepends globs', function () {
    expect(this.file.globs).to.deep.equal([
      'package.json',
      'hash-comment',
      'multi-line-hash-comment',
      'test/fixtures/lib/transformers/extract-directives/deps/**/*'
    ]);
  });
});
