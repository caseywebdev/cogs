var _ = require('underscore');
var async = require('async');
var getExt = require('./get-ext');
var getTransformers = require('./get-transformers');

var handleUpdate = function (file, cb, er, update) {
  if (er) return cb(er);
  file = _.extend({}, file, update);
  var includes = file.includes = _.unique(file.includes);
  var links = file.links = _.difference(_.unique(update.links), includes);
  file.globs = _.difference(_.unique(update.globs), includes, links);
  cb(null, file);
};

module.exports = function (file, options, cb) {
  var transformers = getTransformers(getExt(file.path), options);
  async.waterfall([
    function (cb) { cb(null, file); }
  ].concat(
    _.map(transformers, function (transformer) {
      return function (file, cb) {
        var fn = require('./transformers/' + transformer.name);
        fn(file, transformer.options, _.partial(handleUpdate, file, cb));
      };
    })
  ), cb);
};
