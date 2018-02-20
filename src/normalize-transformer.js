const _ = require('underscore');
const npath = require('npath');

module.exports = transformer => {
  if (_.isString(transformer)) transformer = {name: transformer};
  else if (_.isFunction(transformer)) transformer = {fn: transformer};
  else transformer = _.clone(transformer);

  if (!transformer.options) transformer.options = {};

  if (transformer.fn) return transformer;

  const {name} = transformer;
  if (!name) throw new Error('Each transformer requires a name or fn property');

  const attempts = [`cogs-transformer-${name}`, name, npath.resolve(name)];
  const options = {paths: [process.cwd()]};
  let path;
  for (let attempt of attempts) {
    try {
      path = require.resolve(attempt, options);
      break;
    } catch (er) {
      console.log(er);
    }
  }

  if (!path) {
    throw new Error(
      `Cannot find transformer '${name}'. Did you forget to install it?`
    );
  }

  try { transformer.fn = require(path); } catch (er) {
    throw _.extend(er, {message: `Failed to load '${name}'\n${er.message}`});
  }

  return transformer;
};
