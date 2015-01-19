var _ = require('underscore');
var async = require('async');
var getTransformers = require('./get-transformers');

module.exports = function (file, options, cb) {
  var transformers = getTransformers(file, options);
  async.waterfall([
    function (cb) { cb(null, file.data.toString()); }
  ].concat(
    _.map(transformers, function (transformer) {
      return function (transformed, cb) {
        transformer.transformer(transformed, file, transformer.options, cb);
      };
    })
  ), cb);
};
