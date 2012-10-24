_ = require 'underscore'

module.exports = class CoffeeScript extends (require './processor')
  defaults:
    bare: false

  process: (asset, cb) ->
    try
      coffee = require 'coffee-script'
      options = _({}).extend @options, filename: asset.abs
      asset.raw = coffee.compile asset.raw, options
      asset.exts.push 'js' unless asset.ext() is 'js'
      cb null
    catch er
      cb er
