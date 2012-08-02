# Clean CSS Compressor
cleanCss = require 'clean-css'

module.exports = class CleanCssCompressor extends (require './compressor')
  constructor: (options) ->
    super options

    @compress = (str, callback) ->

      # From the clean-css README
      try
        str = cleanCss.process str
        callback null, str
      catch err
        callback err
