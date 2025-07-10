import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { test } from 'node:test';

const deleteBuilt = async () => {
  try {
    await fs.unlink('test-fixtures/a.built');
    await fs.unlink('test-fixtures/b.built');
    await fs.unlink('test-fixtures/c.built');
    await fs.unlink('test-fixtures/e.built');
    await fs.unlink('test-fixtures/f.built');
  } catch (er) {
    if (er.code !== 'ENOENT') throw er;
  }
};

test('basic build', async () => {
  const { promise, resolve, reject } = Promise.withResolvers();
  await deleteBuilt();
  const ps = spawn('node', ['src/cli.js', '-c', 'test-fixtures/config.js'], {
    stdio: ['inherit', 'inherit', 'inherit']
  });
  ps.on('exit', async code => {
    try {
      assert.equal(code, 0);
      assert.equal(
        (await fs.readFile('test-fixtures/a.built')).toString(),
        '# start\nA\nG\n# end\n'
      );
      assert.equal(
        (await fs.readFile('test-fixtures/b.built')).toString(),
        '# start\nB\nD\n# end\n'
      );
      assert.equal(
        (await fs.readFile('test-fixtures/c.built')).toString(),
        '# start\nC\n# end\n'
      );
      assert.equal(
        (await fs.readFile('test-fixtures/e.built')).toString(),
        '# start\nE\n# end\n'
      );
      assert.equal(
        (await fs.readFile('test-fixtures/f.built')).toString(),
        '# start\nF\n# end\n'
      );
      await deleteBuilt();
      resolve();
    } catch (er) {
      reject(er);
    }
  });

  return promise;
});
