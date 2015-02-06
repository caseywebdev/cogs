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

  var package;
  try { package = require(path.dirname(requirePath) + '/package'); }
  catch (er) {
  try { package = require(packageName + '/package'); } catch (er) {
    throw new Error(
      "Cannot find package file for '" + name + "'\n" +
      '  Transformers are required to have a package file'
    );
  }}

  try {
    transformer.version = package.version;
    if (!transformer.version) throw new Error();
  } catch (er) {
    throw new Error(
      "Cannot find version in package file for '" + name + "'\n" +
      '  Transformers are required to specify a version in their package file'
    );
  }

  return transformer;
};
