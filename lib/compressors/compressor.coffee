# Compressor skeleton
module.exports = class Compressor
  constructor: (options) ->

    # noop, should be overridden
    @compress = (str, callback) ->
      callback null, str

    (@config = (options) ->
      @[name] = option for name, option of options
      @
    ) options
