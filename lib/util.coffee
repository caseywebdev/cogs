fs = require 'fs'
path = require 'path'

module.exports =
  dirObj: (dir) ->
    obj = {}
    for file in fs.readdirSync dir
      continue if file is 'index.coffee' or file[0] is '.'
      name = path
        .basename(file, '.coffee')
        .replace /^([a-z])|-([a-z])/g, (a, b, c) -> (b or c).toUpperCase()
      obj[name] = require "#{dir}/#{file}"
    obj
