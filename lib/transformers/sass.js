var _ = require('underscore');
var async = require('async');
var getDependencyHashes = require('../get-dependency-hashes');
var path = require('path');
var sass = require('node-sass');

var DEFAULTS = {
  includePaths: [],
  indentedSyntax: false
};

module.exports = function (file, options, cb) {
  options = _.extend({}, DEFAULTS, options);
  sass.render(_.extend({}, options, {
    data: file.buffer.toString(),
    includePaths: options.includePaths.concat(path.dirname(file.path)),
    success: function (res) {
      async.waterfall([
        _.partial(getDependencyHashes, {links: _.zip(res.stats.includedFiles)}),
        function (hashes, cb) {
          cb(null, {
            buffer: new Buffer(res.css),
            links: file.links.concat(hashes.links)
          });
        }
      ], cb);
    },
    error: function (er) {
      cb(new Error('Line ' + er.line + ': ' + er.message));
    }
  }));
};
