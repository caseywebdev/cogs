_ = require 'underscore'

module.exports = class ClosureCompiler extends (require './engine')
  defaults:
    compilation_level: 'advanced_optimizations'
    language: 'ecmascript5'

  compress: (str, cb) ->
    try
      url = 'https://closure-compiler.appspot.com/compile'
      form = _.extend {}, @options,
        js_code: str
        output_format: 'json'
        output_info: ['compiled_code', 'errors']
      (require 'request').post url, {form}, (er, res, body) ->
        cb er if er
        data = JSON.parse body
        return cb new Error data.serverErrors[0].error if data.serverErrors
        return cb new Error data.errors[0].error if data.errors
        cb null, data.compiledCode
    catch er
      cb er
