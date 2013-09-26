'use strict';

var _ = require('underscore');
var engines = require('./engines');
var Env = require('./env');

module.exports = _.extend(new Env(), {Env: Env}, engines);
