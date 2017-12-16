const maybeWrite = require('./maybe-write');

module.exports = async build => {
  if (build.targetPath === build.path) {
    throw new Error(`Refusing to overwrite ${build.path}`);
  }

  return maybeWrite(build);
};
