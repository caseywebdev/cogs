# CoffeeScript Processor
coffee = require 'coffee-script'

exports.process = (asset, callback) ->

  # Replace single-line directive comments with multiline comments so
  # CoffeeScript doesn't demolish them.
  str = asset.str.replace ///
    \#
    \s*
    =
    \s*
    (
      (require
      |require_self
      |require_tree)
      .*?
    )
    (\n|$)
  ///gi, '### = $1 ###\n'

  try
    asset.str = coffee.compile str
    asset.exts.unshift 'js' unless asset.ext() is 'js'
    callback()
  catch err
    callback err
