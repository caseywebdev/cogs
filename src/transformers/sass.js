var _ = require('underscore');
var path = require('path');
var sass = require('node-sass');

var DEFAULTS = {
  includePaths: [],
  indentedSyntax: false
};

var getRelative = function (filePath) { return path.relative('.', filePath); };

module.exports = function (file, options, cb) {
  options = _.extend({}, DEFAULTS, options);
  sass.render(_.extend({}, options, {
    data: file.buffer.toString(),
    includePaths: options.includePaths.concat(path.dirname(file.path)),
    success: function (res) {
      var links = _.map(res.stats.includedFiles, getRelative);
      cb(null, {buffer: new Buffer(res.css), links: file.links.concat(links)});
    },
    error: function (er) {
      cb(_.extend(new Error(), er, {
        message: file.path + ': line ' + er.line + ', column ' + er.column +
          ', ' + er.message
      }));
    }
  }));
};
