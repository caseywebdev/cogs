# Default notifiers
xl8 = require '..'

module.exports = ->
  [
    new xl8.notifiers.growl
    new xl8.notifiers.consoler
  ]
