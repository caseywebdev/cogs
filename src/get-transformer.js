var _ = require('underscore');

module.exports = function (transformer) {
  transformer = _.clone(transformer);
  if (_.isString(transformer)) transformer = {name: transformer};
  if (!transformer.options) transformer.options = {};
  var name = transformer.name;
  if (!name) console.log(transformer);
  var packageName = 'cogs-transformer-' + name;
  try {
    require.resolve(packageName);
  } catch (er) {
    throw new Error(
      "Cannot find transformer '" + name + "'\n" +
      '  Did you forget to `npm install ' + packageName + '`?'
    );
  }
  try {
    transformer.fn = require(packageName);
  } catch (er) {
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
