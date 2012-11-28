module.exports = class UglifyJs extends (require './engine')
  compress: (str, cb) ->
    try
      UglifyJS = require 'uglify-js'
      str = UglifyJS.minify(str, fromString: true).code
      cb null, str
    catch er
      cb er
