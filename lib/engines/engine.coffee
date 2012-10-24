_ = require 'underscore'

module.exports = class Engine
  constructor: (options) ->
    @options = _.extend {}, @defaults, options
