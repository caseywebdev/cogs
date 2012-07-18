uglifyjs = require 'uglify-js'
parser = uglifyjs.parser
uglify = uglifyjs.uglify

exports.compress = (asset, callback) ->

  # Based on the example from the uglifyjs README
  try
    str = parser.parse asset.str
    str = uglify.ast_mangle str
    str = uglify.ast_squeeze str
    str = uglify.gen_code str
    console.log str
    callback undefined, str

  # Save this sucka from a syntax error
  catch err
    callback err
