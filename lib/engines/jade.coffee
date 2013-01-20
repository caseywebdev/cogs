_ = require 'underscore'

DIRECIVE_PATTERN = /^\/\/-\s*!(jst|html)/im

module.exports = class Jade extends (require './engine')
  defaults:
    compileDebug: false
    type: 'jst'

  process: (asset, cb) ->
    try
      jade = require 'jade'

      # Grab the extension preceding `.jade`
      ext = asset.ext()

      # Jade presents an interesting problem because it can compile into a
      # function to be used as a JST or directly to HTML. Since simply having
      # a file end with .jade won't tell us which we need to output, I've
      # baked in two options:
      # 1. Name your files `.jst.jade` or `.html.jade`
      # or
      # 2. Put `//- !jst` or `//- !html` somewhere in the .jade file
      # Files that do neither will default to the JST output.

      # Check the preceding extension
      if ext in ['jst', 'html']
        out = ext
      # Check for the output directives
      else if match = asset.raw.match DIRECIVE_PATTERN
        out = match[1]
      else
        out = @options.type

      options = _.extend {}, @options, filename: asset.abs

      # Time to compile
      if out is 'html'
        asset.raw = jade.compile(asset.raw, options)()
      else
        options.client = true
        asset.raw = jade.compile(asset.raw, options).toString()
          .replace(/^function anonymous/, 'function ');
      asset.exts.push out unless ext is out
      cb()
    catch er
      cb er
