'use strict';

var _ = require('underscore');
var Command = require('./command');
var herit = require('herit');

module.exports = herit(Command, {
  defaults: function () {
    return _.extend(_.result(Command.prototype, 'defaults'), {
      command: 'closure-compiler'
    });
  }
});
