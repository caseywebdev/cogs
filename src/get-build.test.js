const getBuild = require('./get-build');

const normalizeConfig = require('./normalize-config');

const config = normalizeConfig({
  transformers: () => ({
    requires: [
      'test-fixtures/a.txt',
      'test-fixtures/b.txt',
      'test-fixtures/c.txt'
    ]
  })
});

test('getBuild', async () => {
  const build =
    await getBuild({env: config[0], path: 'test-fixtures/a.txt'});
  expect(build.buffer.toString()).toEqual('A\nB\nC\n');
});
