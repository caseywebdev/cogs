const _ = require('underscore');
const path = require('npath');
const glob = require('glob');

const clean = p => path.normalize(p);

module.exports = (pattern, options, cb) =>
  glob(pattern, options, (er, paths) =>
    er ? cb(er) : cb(null, _.map(paths, clean))
  );
