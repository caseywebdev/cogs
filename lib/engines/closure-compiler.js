'use strict';

var _ = require('underscore');
var Engine = require('./engine');
var herit = require('herit');

module.exports = herit(Engine, {
  defaults: {
    compilation_level: 'SIMPLE_OPTIMIZATIONS'
  },

  compress: function (str, cb) {
    try {
      var request = require('request');
      var url = 'https://closure-compiler.appspot.com/compile';
      var form = _.extend({}, {
        js_code: str,
        output_format: 'json',
        output_info: ['compiled_code', 'errors']
      }, this.options);
      request.post(url, {form: form}, function (er, res, body) {
        if (er) return cb(er);
        var data = JSON.parse(body);
        if (data.serverErrors) return cb(new Error(data.serverErrors[0].error));
        if (data.errors) return cb(new Error(data.errors[0].error));
        cb(null, data.compiledCode);
      });
    } catch (er) {
      cb(er);
    }
  }
});
