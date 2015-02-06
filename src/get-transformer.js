var _ = require('underscore');
var path = require('path');

module.exports = function (transformer) {
  transformer = _.clone(transformer);
  if (_.isString(transformer)) transformer = {name: transformer};
  if (!transformer.options) transformer.options = {};
  var name = transformer.name;
  var packageName = 'cogs-transformer-' + name;
  var requirePath;
  try { requirePath = require.resolve(path.resolve(name)); } catch (er) {
  try { requirePath = require.resolve(packageName); } catch (er) {
    throw new Error(
      "Cannot find transformer '" + name + "'\n" +
      '  Did you forget to `npm install ' + packageName + '`?'
    );
  }}
  try { transformer.fn = require(requirePath); } catch (er) {
    throw _.extend(er, {
      message: "Failed to load '" + name + "'\n  " + er.message
    });
  }
  try {
    transformer.version = require(packageName + '/package').version;
    if (!transformer.version) throw new Error();
  } catch (er) {
    throw new Error(
      "Cannot find package version for '" + name + "'\n" +
      '  Transformers are required to specifiy a version in their package file'
    );
  }
  return transformer;
};
