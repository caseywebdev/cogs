# Uglifyjs Compressor
uglifyjs = require 'uglify-js'
parser = uglifyjs.parser
uglify = uglifyjs.uglify

module.exports = class UglifyjsCompressor extends (require './compressor')
  constructor: (options) ->
    super options

    @compress = (str, callback) ->

      # Based on the example from the uglifyjs README
      try
        str = parser.parse str
        str = uglify.ast_mangle str
        str = uglify.ast_squeeze str
        str = uglify.gen_code str
        callback null, str
      catch err
        callback err
