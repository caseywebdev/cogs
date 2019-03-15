module.exports = async (cache, key, fn) => {
  try {
    return cache[key] || (await (cache[key] = fn()));
  } catch (er) {
    delete cache[key];
    throw er;
  }
};
