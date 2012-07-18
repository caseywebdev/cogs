# JST Proccessor
exports.process = (asset, callback) ->

  # Wrap the asset in a JST namespace with the logical path as its key
  asset.str = "(this.JST = JST || {})['#{asset.logical}'] = #{asset.str}"

  # Add the `.js` extension if it's not already there
  assets.exts.push 'js' unless asset.ext() is 'js'

  callback()
