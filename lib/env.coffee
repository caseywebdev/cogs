fs = require 'fs'
path = require 'path'
EventEmitter = require('events').EventEmitter
_ = require 'underscore'
processors = require './processors'
Asset = require './asset'

module.exports = class Env extends EventEmitter
  constructor: (options = {}) ->
    @cache = {}
    @paths = []
    @addPath options.paths if options.paths
    @addPath options.path if options.path
    @processors = _.extend
      coffee: new processors.CoffeeScript
      jade: new processors.Jade
      jst: new processors.Jst
      styl: new processors.Stylus
    , options.processors
    @compressors = options.compressors or {}

  build: (logical, cb) ->
    @asset logical, (er, asset) =>
      return cb er if er
      asset.build cb

  asset: (logical, cb) ->
    @abs logical, (er, abs) =>
      return cb er if er
      if @cache[abs]
        cb null, @cache[abs]
      else
        @cache[abs] = new Asset @, abs, cb

  abs: (logical, cb) ->
    candidate =
      priority: -1
      abs: null
    n = 0
    m = @paths.length
    _.each @paths, (p, priority) =>
      check = path.resolve p, logical
      dir = path.dirname check
      fs.readdir dir, (er, files) =>
        unless er
          abs = false
          base = path.basename check
          for file in files
            if file is base or file.indexOf("#{base}.") is 0
              abs = path.join dir, file
              break

          if abs and ((cp = candidate.priority) is -1 or priority < cp)
            candidate =
              priority: priority
              abs: abs

        if ++n is m
          return cb null, candidate.abs if candidate.abs
          cb new Error "Unable to match '#{logical}' to any absolute path"

    cb new Error 'No env paths are defined' unless @paths.length

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
    paths = [paths] if _(paths).isString()
    for p in paths
      @paths.push path.resolve p

  removePath: (paths) ->
    paths = [paths] if _(paths).isString()
    for p in paths
      if ~(i = _(@paths).indexOf path.resolve p)
        @paths.splice i, 1
