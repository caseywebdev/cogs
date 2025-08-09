import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';

const deleteBuilt = async () => {
  try {
    for await (const path of fs.glob('test-fixtures/*.built')) {
      await fs.unlink(path);
    }
  } catch (er) {
    if (er.code !== 'ENOENT') throw er;
  }
};

export default [
  async done => {
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
        done();
      } catch (er) {
        done(er);
      }
    });
  },

  async done => {
    await deleteBuilt();
    const ps = spawn('node', ['src/cli.js', '-c', 'test-fixtures/config2.js'], {
      stdio: ['inherit', 'inherit', 'inherit']
    });
    ps.on('exit', async code => {
      try {
        assert.equal(code, 0);
        assert.equal(
          (await fs.readFile('test-fixtures/a.built')).toString(),
          '# start\nA\nD\n# end\n'
        );
        assert.equal(
          (await fs.readFile('test-fixtures/b.built')).toString(),
          '# start\nB\n# end\n'
        );
        assert.equal(
          (await fs.readFile('test-fixtures/c.built')).toString(),
          '# start\nC\n# end\n'
        );
        await deleteBuilt();
        done();
      } catch (er) {
        done(er);
      }
    });
  }
];
