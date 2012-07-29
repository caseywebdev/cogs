cleanCss = require 'clean-css'

module.exports = new (require './compressor')

  compress: (str, callback) ->

    # From the clean-css README
    try
      str = cleanCss.process str
      callback null, str
    catch err
      callback err
