export default {
  main: {
    transformers: 'test-fixtures/transformer.js',
    builds: {
      'test-fixtures/a.txt': { ext: { '.txt': '.built' } }
    }
  }
};
