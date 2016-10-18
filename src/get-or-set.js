const Promise = require('better-promise').default;

module.exports = (cache, key, fn) =>
  Promise.isPromise(cache[key]) ? cache[key] :
  cache[key] ? Promise.resolve(cache[key]) :
  cache[key] = Promise.resolve().then(() => fn().then(val => cache[key] = val));
