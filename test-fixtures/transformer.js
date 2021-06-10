export default ({ file: { path } }) =>
  ({
    'test-fixtures/a.txt': {
      requires: ['test-fixtures/a.txt'],
      builds: ['test-fixtures/b.txt', 'test-fixtures/c.txt']
    },
    'test-fixtures/b.txt': {
      requires: ['test-fixtures/b.txt'],
      builds: ['test-fixtures/e.txt', 'test-fixtures/f.txt']
    },
    'test-fixtures/c.txt': {
      requires: ['test-fixtures/c.txt', 'test-fixtures/g.txt'],
      builds: ['test-fixtures/e.txt']
    },
    'test-fixtures/e.txt': {
      requires: [
        'test-fixtures/d.txt',
        'test-fixtures/g.txt',
        'test-fixtures/e.txt'
      ],
      builds: ['test-fixtures/a.txt']
    },
    'test-fixtures/f.txt': {
      requires: [
        'test-fixtures/d.txt',
        'test-fixtures/g.txt',
        'test-fixtures/f.txt'
      ],
      builds: ['test-fixtures/a.txt']
    }
  }[path]);
