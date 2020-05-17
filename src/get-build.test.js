const getBuild = require('./get-build');
const normalizeConfig = require('./normalize-config');

const config = normalizeConfig({
  main: {
    transformers: () => ({
      requires: [
        'test-fixtures/a.txt',
        'test-fixtures/b.txt',
        'test-fixtures/c.txt'
      ]
    })
  }
});

test('getBuild', async () => {
  const env = config.main;
  const build = await getBuild({
    env,
    path: 'test-fixtures/a.txt'
  });
  expect(build.buffers[0].toString()).toEqual('A\nB\nC\n');
});
