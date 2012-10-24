module.exports = class CleanCss extends (require './engine')
  compress: (str, cb) ->
    try
      cleanCss = require 'clean-css'
      str = cleanCss.process str
      cb null, str
    catch er
      cb er
