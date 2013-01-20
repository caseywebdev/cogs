_ = require 'underscore'

module.exports = class UnderscoreTemplate extends (require './engine')
  process: (asset, cb) ->
    try
      asset.raw = _.template(asset.raw, null, @options).source
      asset.exts.push 'jst' unless asset.ext() is 'jst'
      cb()
    catch er
      cb er
