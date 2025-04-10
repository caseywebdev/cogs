import normalizeTransformer from './normalize-transformer.js';
import toArray from './to-array.js';

const asyncMapObj = async (obj, fn) =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(obj ?? {}).map(async ([key, val]) => [
        key,
        await fn(val, key)
      ])
    )
  );

export default async config => {
  config = await asyncMapObj(
    config,
    async ({ builds, transformers, manifestPath, requires }, name) => ({
      builds: await asyncMapObj(builds, async target => ({
        ...target,
        transformers: await Promise.all(
          toArray(target.transformers).map(normalizeTransformer)
        )
      })),
      cache: {},
      manifestPath,
      name,
      requires: toArray(requires),
      transformers: await Promise.all(
        toArray(transformers).map(normalizeTransformer)
      )
    })
  );

  Object.values(config).forEach(
    env => (env.requires = toArray(env.requires).map(name => config[name]))
  );

  return config;
};
