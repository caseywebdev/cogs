# CoffeeScript Processor
coffee = require 'coffee-script'

module.exports = class CoffeeScriptProcessor extends (require './processor')
  constructor: (options) ->
    @bare = false

    super options

    @process = (asset, callback) ->
      try
        options =
          filename: asset.abs
          bare: @bare
        asset.raw = coffee.compile asset.raw, options
        asset.exts.push 'js' unless asset.ext() is 'js'
        callback null
      catch err
        callback err
