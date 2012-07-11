# CoffeeScript Compiler
require 'coffee-script'

exports.compile = (asset) ->

  # If

  # Replace single-line directive comments with multiline comments so
  # CoffeeScript doesn't demolish them.
  str = str.replace ///(
    \s*\#\s*=\s*
    (require
    |require_self
    |require_tree)
    \s.*
  )///g, '###$1###'


  asset.str = coffee.compile str
  asset.exts.pop()

# Jade Compiler
require 'jade'

exports.compile = (asset) ->

  # Since Jade
  if options.jst
    jade.compile(str, client: true, debug: true).toString()
  else
    jade.compile(str)()

# Stylus Compiler
require 'stylus'
require 'nib'

exports.compile = (asset) ->
  styl = stylus str, options
  result = null

  if options.nib
    styl.use nib()

  styl.render (err, css) ->
    if err
      throw err
    else
      result = css

  result

# Growl Notifier
growl = require 'growl'
path = require 'path'
images =
  done: path.resolve 'gfx', 'done.png'
  fail: path.resolve 'gfx', 'fail.png'
  progress: path.resolve 'gfx', 'progress.png'

exports.notify = (options) ->
  growl options.message,
    name: 'xl8r'
    title: options.title or 'xl8r'
    image: images[options.image] or options.image or images['done']
    sticky: options.sticy or false
