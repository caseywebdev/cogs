export default ({ file: { path } }) =>
  ({
    'test-fixtures/a.txt': {
      requires: ['test-fixtures/a.txt'],
      builds: ['test-fixtures/b.txt', 'test-fixtures/c.txt']
    },
    'test-fixtures/b.txt': {
      requires: ['test-fixtures/b.txt', 'test-fixtures/d.txt'],
      builds: ['test-fixtures/c.txt']
    },
    'test-fixtures/c.txt': {
      requires: ['test-fixtures/c.txt', 'test-fixtures/d.txt']
    }
  })[path];
