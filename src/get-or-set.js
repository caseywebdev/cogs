const Promise = require('better-promise').default;

module.exports = (cache, key, fn) =>
  cache[key] || Promise.resolve().then(() => cache[key] = fn()).catch(er => {
    delete cache[key];
    throw er;
  });
