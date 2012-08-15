util = require 'util'

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
      title = options.title or style.toUpperCase()
      message = "[xl8] #{title.bold} #{options.message}"
      util.log message[style]
