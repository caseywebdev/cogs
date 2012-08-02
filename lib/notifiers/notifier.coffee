# Notifier skeleton
path = require 'path'
base = path.resolve __dirname, '../../gfx'

module.exports = class Notifier

  images:
    done: path.join base, 'done.png'
    fail: path.join base, 'fail.png'
    info: path.join base, 'info.png'

  constructor: (options) ->
    @config options

  # noop, should be overridden
  notify: ->

  config: (options) ->
    @[name] = option for name, option of options
    @
