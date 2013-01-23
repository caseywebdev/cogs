fs = require 'fs'
path = require 'path'
EventEmitter = require('events').EventEmitter
_ = require 'underscore'
engines = require './engines'
Asset = require './asset'

module.exports = class Env extends EventEmitter
  constructor: (options = {}) ->
    @cache = {}
    @paths = []
    @addPath options.paths if options.paths
    @addPath options.path if options.path
    @processors = _.extend
      coffee: new engines.CoffeeScript
      jade: new engines.Jade
      jst: new engines.Jst
      styl: new engines.Stylus
      underscore: new engines.Underscore
    , options.processors
    @compressors = options.compressors or {}

  asset: (logical, cb) ->
    @abs logical, (er, abs) =>
      return cb er if er
      if @cache[abs]
        cb null, @cache[abs]
      else
        @cache[abs] = new Asset @, abs, cb

  saveToDir: (logical, dir, cb) ->
    @asset logical, (er, asset) ->
      return cb er if er
      asset.saveToDir logical, dir, cb

  saveAs: (logical, p, cb) ->
    @asset logical, (er, asset) ->
      return cb er if er
      asset.saveToDir logical, p, cb

  abs: (logical, cb) ->
    best =
      priority: -1
      abs: null

    done = _.after @paths.length, (abs) ->
      return cb new Error 'No env paths are defined' if abs is undefined
      return cb null, abs if abs
      cb new Error "Unable to match '#{logical}' to any absolute path"

    for p, priority in @paths then do (p, priority) =>
      check = path.resolve p, logical
      dir = path.dirname check
      fs.readdir dir, (er, files) ->
        unless er
          abs = false
          base = path.basename check
          for file in files
            if file is base or file.indexOf("#{base}.") is 0
              abs = path.join dir, file
              break

          if abs and ((cp = best.priority) is -1 or priority < cp)
            best =
              priority: priority
              abs: abs

        done best.abs

  logical: (abs, cb) ->
    fs.stat abs, (er, stat) =>
      return cb new Error "'#{abs}' does not exist" if er
      dirname = path.dirname abs
      basename = path.basename(abs).replace /\..*$/, ''
      abs = path.resolve dirname, basename
      for p in @paths
        if abs.indexOf(p) is 0
          return cb null, abs[p.length + 1..-1]
      cb new Error "Unable to match '#{abs}' to any logical path"

  addPath: (paths) ->
    # Remove existing matches
    @removePath paths
    paths = [paths] if typeof paths is 'string'
    for p in paths
      @paths.push path.resolve p

  removePath: (paths) ->
    paths = [paths] if typeof paths is 'string'
    for p in paths
      if ~(i = @paths.indexOf path.resolve p)
        @paths.splice i, 1
