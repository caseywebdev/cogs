# Stylus Processor
stylus = require 'stylus'
nib = require 'nib'

exports.process = (asset, callback) ->

  stylus(asset.str).use(nib()).render (err, css) ->
    return callback err if err

    asset.str = css
    # Add the `.css` extension if it's not already there
    asset.exts.push 'css' unless asset.ext() is 'css'
    callback()
