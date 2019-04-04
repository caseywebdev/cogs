const { promisify } = require('util');
const fs = require('fs');
const npath = require('npath');
const normalizeConfig = require('./normalize-config');

const exists = promisify(fs.exists);

module.exports = async configPath => {
  try {
    const path = npath.resolve(configPath);
    if (!(await exists(path))) throw new Error(`'${path}' does not exist`);

    delete require.cache[path];
    // eslint-disable-next-line import/no-dynamic-require
    return normalizeConfig(require(path));
  } catch (er) {
    throw new Error(`Unable to load '${configPath}'\n${er.stack}`);
  }
};
