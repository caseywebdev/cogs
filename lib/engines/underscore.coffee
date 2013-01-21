_ = require 'underscore'

module.exports = class Underscore extends (require './engine')
  defaults:
    variable: 'o'

  process: (asset, cb) ->
    try
      asset.raw = _.template(asset.raw, null, @options).source
      asset.exts.push 'jst' unless asset.ext() is 'jst'
      cb()
    catch er
      cb er
