# CoffeeScript Processor
coffee = require 'coffee-script'

exports.process = (asset, callback) ->
  try
    asset.str = coffee.compile asset.str
    asset.exts.unshift 'js' unless asset.ext() is 'js'
    callback()
  catch err
    callback err
