fs = require 'fs'

for file in fs.readdirSync __dirname
  name = file
    .replace(/\.[^.]*$/, '')
    .replace /^([a-z])|-([a-z])/g, (__, a, b) -> (a or b).toUpperCase()
  continue unless name and name isnt 'Index'
  module.exports[name] = require "./#{file}"
