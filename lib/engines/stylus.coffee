module.exports = class Stylus extends (require './engine')
  defaults:
    compress: false
    nib: true
    importNib: true

  process: (asset, cb) ->
    try
      stylus = require 'stylus'
      styl = stylus asset.raw
      styl.set 'filename', asset.abs
      styl.set 'compress', true if @options.compress
      if @options.nib
        nib = require 'nib'
        styl.use nib()
        styl.import 'nib' if @options.importNib

      styl.render (er, css) ->
        return cb er if er

        asset.raw = css

        # Add the `.css` extension if it's not already there
        asset.exts.push 'css' unless asset.ext() is 'css'
        cb()
    catch er
      cb er
