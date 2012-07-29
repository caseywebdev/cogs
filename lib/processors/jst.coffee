# JST Proccessor
module.exports = new (require './processor')
  namespace: 'JST'
  process: (asset, callback) ->

    # Wrap the asset in a JST namespace with the logical path as its key
    asset.raw = "(this['#{@namespace}'] = this['#{@namespace}'] || {})['#{asset.logical}'] = #{asset.raw}"

    # Add the `.js` extension if it's not already there
    assets.exts.push 'js' unless asset.ext() is 'js'

    callback null
