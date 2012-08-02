# Default compressors (probably best to leave these empty)
xl8 = require '..'

module.exports = ->
  js: null # new xl8.compressors.uglifyjs
  css: null # new xl8.compressors.cleanCss
