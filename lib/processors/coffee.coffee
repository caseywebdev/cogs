# CoffeeScript Processor
coffee = require 'coffee-script'
module.exports = new (require './processor')
  process: (asset, callback) ->
    try
      asset.raw = coffee.compile asset.raw
      asset.exts.push 'js' unless asset.ext() is 'js'
      callback null
    catch err
      callback err
