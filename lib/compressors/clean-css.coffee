cleanCss = require 'clean-css'

exports.compress = (asset, callback) ->

  # Based on the example from the clean-css README
  try
    str = cleanCss.process asset.str
    callback undefined, str

  # Save this sucka from a syntax error
  catch err
    callback err
