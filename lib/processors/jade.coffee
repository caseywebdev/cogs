# Jade Processor
jade = require 'jade'

module.exports = new (require './processor')
  debug: false
  process: (asset, callback) ->

    # Grab the extension preceding `.jade`
    ext = asset.ext()

    # Jade presents an interesting problem because it can compile into a
    # function to be used as a JST or directly to HTML. Since simply having a
    # file end with .jade won't tell us which we need to output, I've baked in
    # two options:
    # 1. Name your files `.jst.jade` or `.html.jade`
    # or
    # 2. Put `//- !jst` or `//- !html` on its own line somewhere in the .jade
    # file
    # Files that do neither will default to the JST output.

    # Check the preceding extension
    if ext in ['jst', 'html']
      out = ext
    # Check for the output directives
    else if match = asset.raw.match /(^|\n)\/\/- !(jst|html)(\n|$)/i
      out = match[1]

    options =
      filename: asset.abs
    try
      # Time to compile
      if out is 'html'
        asset.raw = jade.compile(asset.raw, options)()
        asset.exts.push 'html' unless ext is 'html'
      else
        options.client = true
        options.compileDebug = @debug
        asset.raw = jade.compile(asset.raw, options).toString()
        asset.exts.push 'jst' unless ext is 'jst'
      callback null
    catch err
      callback err
