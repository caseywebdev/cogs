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
  it('works', async () => {
    const build =
      await getBuild({env: config.envs[0], path: 'test/fixtures/a.txt'});
    expect(build.toString()).to.equal('A\nB\nC\n');
  });
});
