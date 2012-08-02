# Processor skeleton
module.exports = class Processor
  constructor: (options) ->

    # noop, should be overridden
    @process = (asset, callback) ->
      callback null

    (@config = (options) ->
      @[name] = option for name, option of options
      @
    ).call @, options
