# Notifier skeleton
path = require 'path'
base = path.resolve __dirname, '../../gfx'

module.exports = class Notifier
  constructor: (options) ->
    @images =
      done: path.join base, 'done.png'
      fail: path.join base, 'fail.png'
      info: path.join base, 'info.png'

    # noop, should be overridden
    @notify = ->

    (@config = (options) ->
      @[name] = option for name, option of options
      @
    ).call @, options
