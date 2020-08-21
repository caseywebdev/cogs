import fs from 'fs';
import npath from 'path';
import url from 'url';

import commander from 'commander';

const { program } = commander;
const { path: thisPath } = url.parse(import.meta.url);
const packagePath = `${npath.dirname(thisPath)}/../package.json`;
const { version } = JSON.parse(fs.readFileSync(packagePath));

export default argv =>
  program
    .version(version)
    .description('The fast file transform pipeline.')
    .option('-c, --config-path [path]', 'load config from [path]', 'cogs.js')
    .option(
      '-d, --debounce [seconds]',
      'trigger a build at most every [seconds] seconds',
      parseFloat,
      0.1
    )
    .option(
      '-w, --watch-paths [path]',
      'rebuild if [path] changes, can be specified multiple times',
      (path, paths = []) => [].concat(paths, path)
    )
    .option(
      '-p, --use-polling',
      'use stat polling instead of fsevents when watching'
    )
    .option('-s, --silent', 'do not output build information, only errors')
    .option('-C, --no-color', 'disable colored output')
    .parse(argv);
