var _ = require('underscore');
var Sass = require('./sass');

module.exports = _.inherit(Sass, {
  defaults: function () {
    return _.extend(_.result(Sass.prototype, 'defaults'), {command: 'scss'});
  }
});
