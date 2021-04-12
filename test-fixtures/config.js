export default {
  main: {
    transformers: 'test-fixtures/transformer.js',
    builds: {
      'test-fixtures/a.txt': {
        ext: { '.txt': '.built' },
        transformers: {
          fn: ({ file: { buffer } }) => ({
            buffer: Buffer.from(`# start\n${buffer}# end\n`)
          })
        }
      }
    }
  }
};
