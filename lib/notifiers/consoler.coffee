# Consoler Notifier
(colors = require 'colors').setTheme
  info: 'grey'
  done: 'green'
  fail: 'red'

module.exports = class ConsolerNotifier extends (require './notifier')
  constructor: (options) ->
    super options

    @notify = (options = {}) ->
      style =
        if options.image in ['info', 'done', 'fail']
        then options.image
        else 'info'
      message =
        "#{"[#{style.toUpperCase()}] " +
        "#{options.title or 'xl8'}".bold} " +
        "#{options.message}"
      console.log message[style]
