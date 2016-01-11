var _ = require('underscore');
var path = require('path');

const NOOP = {
  name: 'noop',
  fn: (file, options, cb) => cb(),
  version: '1.0.0'
};

module.exports = function (transformer) {
  transformer = _.clone(transformer);
  if (_.isString(transformer)) transformer = {name: transformer};
  if (!transformer.options) transformer.options = {};

  const name = transformer.name || 'noop';
  if (name === 'noop') return _.extend(transformer, NOOP);
  if (!transformer.fn) {
    var pkgName = 'cogs-transformer-' + name;
    var requirePath;
    try { requirePath = require.resolve(path.resolve(name)); } catch (er) {
    try { requirePath = require.resolve(pkgName); } catch (er) {
      throw new Error(
        "Cannot find transformer '" + name + "'\n" +
        '  Did you forget to `npm install ' + pkgName + '`?'
      );
    }}

    try { transformer.fn = require(requirePath); } catch (er) {
      throw _.extend(er, {
        message: "Failed to load '" + name + "'\n  " + er.message
      });
    }
  }

  if (!transformer.version) {
    var pkg;
    try { pkg = require(path.dirname(requirePath) + '/package'); } catch (er) {
    try { pkg = require(pkgName + '/package'); } catch (er) {
      throw new Error(
        "Cannot find package file for '" + name + "'\n" +
        '  Transformers are required to set a version or have a package file'
      );
    }}

    try {
      transformer.version = pkg.version;
      if (!transformer.version) throw new Error();
    } catch (er) {
      throw new Error(
        "Cannot find version in package file for '" + name + "'\n" +
        '  Transformers are required to specify a version in their package file'
      );
    }
  }

  return transformer;
};
