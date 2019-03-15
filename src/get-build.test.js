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
    }),
    builds: {
      'test-fixtures/a.txt': {
        transformers: ({ file: { buffer } }) => ({
          buffer: buffer.toString().toLowerCase()
        })
      }
    }
  }
});

test('getBuild', async () => {
  const env = config.main;
  const build = await getBuild({
    env,
    path: 'test-fixtures/a.txt',
    transformers: env.builds['test-fixtures/a.txt'].transformers
  });
  expect(build.buffer.toString()).toEqual('a\nb\nc\n');
});
