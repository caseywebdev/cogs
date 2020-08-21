import npath from 'path';

import normalizeConfig from './normalize-config.js';

export default async configPath => {
  try {
    const path = npath.resolve(configPath);
    const { default: config } = await import(`${path}?at=${Date.now()}`);
    return await normalizeConfig(config);
  } catch (er) {
    throw new Error(`Unable to load '${configPath}'\n${er.stack}`);
  }
};
