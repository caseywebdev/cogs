const _ = require('underscore');
const npath = require('npath');

module.exports = (type, handler) => {
  if (_.isString(handler)) handler = {name: handler};
  else if (_.isFunction(handler)) handler = {fn: handler};
  else handler = _.clone(handler);

  if (!handler.options) handler.options = {};

  if (handler.fn) return handler;

  const {name} = handler;
  if (!name) throw new Error(`${type} requires a name or fn property`);

  let path;
  try { path = require.resolve(npath.resolve(name)); } catch (__) {
  try { path = require.resolve(`cogs-${type}-${name}`); } catch (er) {
    throw new Error(
      `Cannot find ${type} '${name}'. Did you forget to install it?`
    );
  }}

  try { handler.fn = require(path); } catch (er) {
    throw _.extend(er, {message: `Failed to load '${name}'\n  ${er.message}`});
  }

  return handler;
};
