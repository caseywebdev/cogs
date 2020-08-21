import npath from 'path';

import _ from 'underscore';

export default async transformer => {
  if (_.isString(transformer)) transformer = { name: transformer };
  else if (_.isFunction(transformer)) transformer = { fn: transformer };
  else transformer = _.clone(transformer);

  if (!transformer.options) transformer.options = {};

  if (transformer.fn) return transformer;

  const { name } = transformer;
  if (!name) throw new Error('Each transformer requires a name or fn property');

  const attempts = [`cogs-transformer-${name}`, name, npath.resolve(name)];
  for (const attempt of attempts) {
    try {
      transformer.fn = (await import(attempt)).default;
      return transformer;
    } catch (er) {
      if (er.code !== 'ERR_MODULE_NOT_FOUND') {
        throw _.extend(er, {
          message: `Failed to load '${name}'\n${er.message}`
        });
      }
    }
  }

  throw new Error(
    `Cannot find transformer '${name}'. Did you forget to install it?`
  );
};
