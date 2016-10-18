const {expect} = require('chai');

const {describe, it} = global;

const getBuild = require('../src/get-build');

const normalizeConfig = require('../src/normalize-config');

const config = normalizeConfig({
  transformers: () => ({
    requires: [
      'test/fixtures/a.txt',
      'test/fixtures/b.txt',
      'test/fixtures/c.txt'
    ]
  })
});

describe('getBuild', () => {
  it('works', done => {
    getBuild({env: config.envs[0], path: 'test/fixtures/a.txt'}).then(build => {
      expect(build.toString()).to.equal('A\nB\nC\n');
      done();
    });
  });
});
