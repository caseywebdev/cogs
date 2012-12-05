module.exports = class extends (require './engine')
  compress: (str, cb) ->
    try
      cb null, require('clean-css').process str
    catch er
      cb er
