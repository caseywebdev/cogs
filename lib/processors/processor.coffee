_ = require 'underscore'

module.exports = class Processor
  constructor: (options) ->
    @options = _({}).extend @defaults, options
