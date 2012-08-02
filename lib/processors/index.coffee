# Default processors
xl8 = require '..'

module.exports = ->
  coffee: new xl8.processors.coffee
  jade: new xl8.processors.jade
  jst: new xl8.processors.jst
  styl: new xl8.processors.styl
