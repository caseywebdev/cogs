const _ = require('underscore');
const getTransformers = require('./get-transformers');
const setExt = require('./set-ext');

module.exports = filePath =>
  _.reduce(
    getTransformers(filePath),
    (filePath, transformer) => setExt(filePath, transformer.ext),
    filePath
  );
