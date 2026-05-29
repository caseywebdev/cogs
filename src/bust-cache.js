import fileHasDependency from './file-has-dependency.js';

export default ({ config, path }) =>
  Promise.all(
    Object.values(config).map(async ({ cache }) => {
      const { buffers, files } = cache;
      delete buffers[path];
      delete files[path];
      await Promise.all(
        Object.entries(files).map(async ([key, file]) => {
          if (fileHasDependency({ file: await file, path })) delete files[key];
        })
      );
    })
  );
