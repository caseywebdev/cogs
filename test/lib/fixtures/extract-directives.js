var expect = require('chai').expect;
var extractDirectives = require('../../../lib/transformers/extract-directives');
var fs = require('fs');
var getHash = require('../../../lib/get-hash');
var path = require('path');

var before = global.before;
var describe = global.describe;
var it = global.it;

describe('extractDirectives(file, config, cb)', function () {
  var inPath = 'test/fixtures/lib/transformers/extract-directives/in';
  var outPath = 'test/fixtures/lib/transformers/extract-directives/out';
  var inBuffer = fs.readFileSync(inPath);
  var outBuffer = fs.readFileSync(outPath);

  var beforeFile = {
    path: path.relative('.', inPath),
    buffer: inBuffer,
    includes: [[inPath, getHash(inBuffer)]],
    links: [],
    globs: []
  };

  before(function (done) {
    var self = this;
    extractDirectives(beforeFile, {}, function (er, file) {
      if (er) return done(er);
      self.afterFile = file;
      done();
    });
  });

  it('extracts the directive lines', function () {
    expect(this.afterFile.buffer.toString()).to.equal(outBuffer.toString());
  });

  it('prepends includes', function () {
    expect(this.afterFile.includes).to.deep.equal([[
        'test/fixtures/lib/transformers/extract-directives/in',
        '9b9d5d69f6e4518e191f44ae38e62d45'
      ], [
        'test/fixtures/lib/transformers/extract-directives/deps/a',
        'd41d8cd98f00b204e9800998ecf8427e'
      ], [
        'test/fixtures/lib/transformers/extract-directives/deps/b',
        'd41d8cd98f00b204e9800998ecf8427e'
      ],
      beforeFile.includes[0]
    ]);
  });

  it('prepends links', function () {
    expect(this.afterFile.links).to.deep.equal([[
      'package.json',
      getHash(fs.readFileSync('package.json'))
    ]]);
  });

  it('prepends globs', function () {
    expect(this.afterFile.globs).to.deep.equal([[
      'package.json',
      '8f8a2ced1c8210f022d1a01303051ab2'
    ], [
      'hash-comment',
      'd751713988987e9331980363e24189ce'
    ], [
      'multi-line-hash-comment',
      'd751713988987e9331980363e24189ce'
    ], [
      'test/fixtures/lib/transformers/extract-directives/deps/**/*',
      'b90ca27c9a471a185e17f24178650e7a'
    ]]);
  });
});
