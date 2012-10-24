module.exports = class UglifyJs extends (require './compressor')
  compress: (str, cb) ->
    try
      uglifyjs = require 'uglify-js'
      parser = uglifyjs.parser
      uglify = uglifyjs.uglify
      str = parser.parse str
      str = uglify.ast_mangle str
      str = uglify.ast_squeeze str
      str = uglify.gen_code str
      cb null, str
    catch err
      cb err
