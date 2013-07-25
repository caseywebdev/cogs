'use strict';

var _ = require('underscore');
var fs = require('fs');

_.each(fs.readdirSync(__dirname), function (file) {
  var name = file
    .replace(/\.[^.]*$/, '')
    .replace(/^([a-z])|-([a-z])/g, function (__, a, b) {
      return (a || b).toUpperCase();
    });
  if (name && name !== 'Index') module.exports[name] = require('./' + file);
});
