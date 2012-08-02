module.exports =
  Env: require './env'

  # Expose built-in processors/compressors/notifiers for easy access
  processors:
    coffee: require './processors/coffee'
    styl: require './processors/styl'
    jade: require './processors/jade'
    jst: require './processors/jst'

  compressors:
    uglifyjs: require './compressors/uglifyjs'
    cleanCss: require './compressors/clean-css'

  notifiers:
    growl: require './notifiers/growl'
    consoler: require './notifiers/consoler'
