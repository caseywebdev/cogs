exports = class Asset

  constructor: (path) ->
    @path = path
    i = path.indexOf '.'
    @base = path[0..i]
    @ext = path[i..-1].split '.'
