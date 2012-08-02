# JST Proccessor
module.exports = class JstProcessor extends (require './processor')
  namespace: 'JST'
  process: (asset, callback) ->

    asset.logical (err, logical) =>
      return callback err if err
      # Wrap the asset in a JST namespace with the logical path as its key
      asset.raw = "(this['#{@namespace}'] = this['#{@namespace}'] || {})['#{logical}'] = #{asset.raw};\n"

      # Add the `.js` extension if it's not already there
      asset.exts.push 'js' unless asset.ext() is 'js'

      callback null
