const {promisify} = require('util');
const fs = require('fs');
const normalizeConfig = require('./normalize-config');
const npath = require('npath');

const exists = promisify(fs.exists);

module.exports = async configPath => {
  try {
    const path = npath.resolve(configPath);
    if (!await exists(path)) throw new Error(`'${path}' does not exist`);

    delete require.cache[path];
    return normalizeConfig(require(path));
  } catch (er) {
    throw new Error(`Unable to load '${configPath}'\n${er.stack}`);
  }
};
