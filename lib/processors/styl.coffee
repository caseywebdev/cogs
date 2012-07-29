# Stylus Processor
stylus = require 'stylus'
nib = require 'nib'
module.exports = new (require './processor')
  compress: false
  nib: true
  importNib: true
  process: (asset, callback) ->
    styl = stylus asset.raw

    styl.set 'compress', true if @compress

    if @nib
      styl.use nib()
      styl.import 'nib' if @importNib

    styl.render (err, css) ->
      return callback err if err

      asset.raw = css
      # Add the `.css` extension if it's not already there
      asset.exts.push 'css' unless asset.ext() is 'css'
      callback null
