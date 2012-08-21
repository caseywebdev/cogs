fs = require 'fs'
path = require 'path'
_ = require 'underscore'
Asset = require './asset'

module.exports = class Env

  constructor: (options = {}) ->

    @build = (logical, callback) ->
      @asset logical, (err, asset) =>
        return callback err if err
        asset.build callback

    @asset = (logical, callback) ->
      @abs logical, (err, abs) =>
        return callback err if err
        if @cache[abs]
          callback null, @cache[abs]
        else
          @cache[abs] = new Asset @, abs, callback

    @abs = (logical, callback) ->
      candidate =
        priority: -1
        abs: null
      n = 0
      m = @paths.length
      _.each @paths, (p, priority) =>
        check = path.resolve p, logical
        dir = path.dirname check
        fs.readdir dir, (err, files) =>
          unless err
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
            return callback null, candidate.abs if candidate.abs
            callback new Error "Unable to match '#{logical}' to any absolute path"

      callback new Error 'No env paths are defined' unless @paths.length

    @logical = (abs, callback) ->
      fs.exists abs, (exists) =>
        if exists
          abs = path.dirname(abs) + path.basename(abs).replace /\..*$/, ''
          for p in @paths
            if abs.indexOf(p) is 0
              return callback null, abs[p.length + 1..-1]
          callback new Error "Unable to match '#{abs}' to any logical path"
        else
          callback new Error "'#{abs}' does not exist"

    @addPath = (paths) ->
      # Remove existing matches
      @removePath paths
      paths = [paths] if typeof paths is 'string'
      for p in paths
        @paths.push path.resolve p

    @removePath = (paths) ->
      paths = [paths] if typeof paths is 'string'
      for p in paths
        if ~(i = @paths.indexOf path.resolve p)
          @paths.splice i, 1

    @notify = (options) ->
      for notifier in @notifiers
        notifier.notify options

    @info = (message, title) ->
      @notify
        title: title
        message: message
        image: 'info'

    @done = (message, title) ->
      @notify
        title: title
        message: message
        image: 'done'

    @fail = (message, title) ->
      @notify
        title: title
        message: message
        image: 'fail'

    @cache = {}
    @paths = []
    @addPath options.path if options.path
    @addPath options.paths if options.paths
    @processors = _.extend require('./processors')(), options.processors
    @compressors =  _.extend require('./compressors')(), options.compressors
    @notifiers = _.union require('./notifiers')(), options.notifiers or []
