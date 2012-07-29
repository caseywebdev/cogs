# Processor skeleton
module.exports = class Processor

  constructor: (options) ->
    @config options

  # noop, should be overridden
  processor: (asset, callback) ->
    callback null

  config: (options) ->
    @[name] = option for name, option of options
    @
