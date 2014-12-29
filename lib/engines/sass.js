'use strict';

var _ = require('underscore');
var Scss = require('./scss');
var herit = require('herit');

module.exports = herit(Scss, {
  defaults: function () {
    return _.extend(_.result(Scss.prototype, 'defaults'), {
      indentedSyntax: true
    });
  }
});
