fs = require 'fs'
path = require 'path'
_ = require 'underscore'
Asset = require './asset'

class Env

  constructor: (options = {}) ->
    @cache = {}
    @paths = []
    @addPath options.paths if options.paths
    @processors = _.extend require('./processors'), options.processors
    @compressors =  _.extend require('./compressors'), options.compressors
    @notifiers = _.extend require('./notifiers'), options.notifiers

  xl8: (logical, callback) ->
    @asset logical, (err, asset) ->
      return callback err if err

      asset.xl8 callback

  asset: (logical, callback) ->
    @abs logical, (err, abs) =>
      return callback err if err

      if @cache[abs]
        callback err, @cache[abs]
      else
        new Asset @, abs, callback

  abs: (logical, callback) ->
    candidate =
      priority: -1
      abs: undefined
    n = 0
    _.each @paths, (p, priority) =>
      check = path.resolve p, logical
      dir = path.dirname check
      fs.readdir dir, (err, files) =>
        abs = false
        unless err
          base = path.basename check
          for file in files
            if file is base or file.indexOf("#{base}.") is 0
              abs = path.join dir, file
              break

          if abs and ((cp = candidate.priority) is -1 or priority < cp)
            candidate =
              priority: priority
              abs: abs

        if ++n is @paths.length
          if candidate.abs is undefined
            callback new Error 'Unable match logical path to any absolute path'
          else
            callback undefined, candidate.abs

    callback new Error 'No env paths are defined' unless @paths.length

  logical: (abs, callback) ->
    fs.exists abs, (exists) =>
      if exists
        abs = if ~(i = abs.indexOf '.') then abs[0...i] else abs
        for p in @paths
          if abs.indexOf(p) is 0
            return callback undefined, abs[p.length + 1..-1]
        callback new Error 'Unable to match absolute path to any logical path'
      else
        callback new Error 'Absolute path does not exist'

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

module.exports = Env
