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
  const buffers = {};

  config = await asyncMapObj(
    config,
    async ({ builds, transformers, manifestPath, requires }, name) => ({
      builds: await asyncMapObj(builds, async ({ transformers, ...build }) => ({
        ...build,
        transformers: await Promise.all(
          toArray(transformers).map(normalizeTransformer)
        )
      })),
      cache: { buffers, files: {} },
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
