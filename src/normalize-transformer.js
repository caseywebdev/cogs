const _ = require('underscore');
const npath = require('npath');

module.exports = transformer => {
  if (_.isString(transformer)) transformer = {name: transformer};
  else if (_.isFunction(transformer)) transformer = {fn: transformer};
  else transformer = _.clone(transformer);

  if (!transformer.options) transformer.options = {};

  if (transformer.fn) return transformer;

  const {name} = transformer;
  if (!name) {
    throw new Error('A transformer name or fn property is required');
  }

  let requirePath;
  const pkgName = `cogs-transformer-${name}`;
  try { requirePath = require.resolve(name); } catch (__) {
  try { requirePath = require.resolve(npath.resolve(name)); } catch (__) {
  try { requirePath = require.resolve(pkgName); } catch (er) {
    throw new Error(
      `Cannot find transformer '${name}'\n  Did you forget to install it?`
    );
  }}}

  try { transformer.fn = require(requirePath); } catch (er) {
    throw _.extend(er, {message: `Failed to load '${name}'\n  ${er.message}`});
  }

  return transformer;
};
