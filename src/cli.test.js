import { strict as assert } from 'assert';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';

const deleteBuilt = async () => {
  try {
    await fs.unlink('test-fixtures/a.built');
  } catch (er) {
    if (er.code !== 'ENOENT') throw er;
  }
};

export default async done => {
  await deleteBuilt();
  const ps = spawn('node', ['src/cli.js', '-c', 'test-fixtures/config.js'], {
    stdio: ['inherit', 'inherit', 'inherit']
  });
  ps.on('exit', async code => {
    try {
      assert.equal(code, 0);
      assert.equal(
        (await fs.readFile('test-fixtures/a.built')).toString(),
        '# start\nA\nB\nC\n# end\n'
      );
      await deleteBuilt();
      done();
    } catch (er) {
      done(er);
    }
  });
};
