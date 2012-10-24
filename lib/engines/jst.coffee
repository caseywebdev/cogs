module.exports = class Jst extends (require './engine')
  defaults:
    namespace: 'JST'

  process: (asset, cb) ->
    asset.logical (er, logical) =>
      return cb er if er

      # Wrap the asset in a JST namespace with the logical path as its key
      asset.raw = "(this['#{@options.namespace}'] = this['#{@options.namespace}'] || {})['#{logical}'] = #{asset.raw};\n"

      # Add the `.js` extension if it's not already there
      asset.exts.push 'js' unless asset.ext() is 'js'

      cb null
