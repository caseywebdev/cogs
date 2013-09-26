'use strict';

var _ = require('underscore');
var Sass = require('./sass');
var herit = require('herit');

module.exports = herit(Sass, {
  defaults: function () {
    return _.extend(_.result(Sass.prototype, 'defaults'), {command: 'scss'});
  }
});
