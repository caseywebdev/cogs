_ = require 'underscore'

module.exports = class Compressor
  constructor: (options) ->
    @options = _({}).extend @defaults, options
