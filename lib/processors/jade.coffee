# Jade Processor
jade = require 'jade'

exports.process = (asset, callback) ->

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
  else if match = asset.str.match /(^|\n)\/\/- !(jst|html)(\n|$)/i
    out = match[1]

  try
    # Time to compile
    if out is 'html'
      asset.str = jade.compile(str, client: true, debug: false).toString()
      assets.exts.push 'html' unless ext
    else
      asset.str = jade.compile(str)()
      assest.exts.push 'jst' unless ext
    callback()
  catch err
    callback err
